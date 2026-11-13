import React, { Suspense, lazy, useState, useEffect } from 'react';
import { db } from './firebase'; 
import Auth from './components/Auth';
import TamQuan from './components/TamQuan';
import ChanhDien from './components/ChanhDien'; 
import TinhTamDien from './components/TinhTamDien';
import TangKinhCac from './components/TangKinhCac';
const CoCaro = lazy(() => import('./components/CoCaro'));
const CoVua = lazy(() => import('./components/CoVua'));
const CoTuong = lazy(() => import('./components/CoTuong'));
const CoVay = lazy(() => import('./components/covay'));

import { ref, onValue, remove, update, get, runTransaction } from 'firebase/database';
import { revokePendingGameInvites } from './components/boardGameInvites';

export default function App() {
  // Khởi tạo currentUser an toàn từ localStorage (có try...catch chống đơ)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('kps_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Lỗi đọc localStorage:", error);
      localStorage.removeItem('kps_current_user');
      return null;
    }
  }); 

  // Tự động chuyển sang 'tamquan' nếu đã có currentUser nhưng màn hình vẫn là 'auth'
  const [currentScreen, setCurrentScreen] = useState(() => {
    const savedUser = localStorage.getItem('kps_current_user');
    return savedUser ? 'tamquan' : 'auth';
  });

  // Dữ liệu realtime từ Firebase
  const [activeUsers, setActiveUsers] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [logs, setLogs] = useState([]); 

  const [boardGameInvite, setBoardGameInvite] = useState(null);

  // Tự động đồng bộ vị trí màn hình hiện tại lên Firebase Realtime Database
  useEffect(() => {
    if (!currentUser?.username) return;
    const userOnlineRef = ref(db, `online_users/${currentUser.username}`);

    const isInBoardGame = currentScreen === 'CoCaro' || currentScreen.startsWith('CoCaro_') ||
      currentScreen === 'CoVua' || currentScreen.startsWith('CoVua_') ||
      currentScreen === 'CoTuong' || currentScreen.startsWith('CoTuong_') ||
      currentScreen === 'covay' || currentScreen.startsWith('covay_');
    update(userOnlineRef, {
      username: currentUser.username,
      fullName: currentUser.fullName || currentUser.username,
      gender: currentUser.gender || 'khac',
      currentScreen: currentScreen,
      lastActive: Date.now(),
      ...(!isInBoardGame ? { activeGame: null, gameStatus: null } : {})
    }).catch((err) => console.error("Lỗi cập nhật vị trí:", err));
  }, [currentScreen, currentUser]);

  useEffect(() => {
    if (!currentUser?.username) return;
    const inviteRef = ref(db, `board_game_invites/${currentUser.username}`);
    return onValue(inviteRef, (snapshot) => setBoardGameInvite(snapshot.val()));
  }, [currentUser]);

  const handleAcceptBoardGameInvite = async () => {
    if (!currentUser?.username) return;
    const inviteRef = ref(db, `board_game_invites/${currentUser.username}`);
    const invite = (await get(inviteRef)).val();
    if (!invite) {
      setBoardGameInvite(null);
      return;
    }
    const { game, roomId, fromUsername } = invite;
    const games = {
      caro: { screen: 'CoCaro', colors: ['X', 'O'] },
      chess: { screen: 'CoVua', colors: ['w', 'b'] },
      xiangqi: { screen: 'CoTuong', colors: ['r', 'b'] },
      go: { screen: 'covay', colors: ['B', 'W'] }
    };
    const gameInfo = games[game];
    if (!gameInfo || !roomId || !fromUsername) {
      alert('Lời mời chơi cờ không hợp lệ.');
      await remove(ref(db, `board_game_invites/${currentUser.username}`));
      setBoardGameInvite(null);
      return;
    }

    try {
      const roomRef = ref(db, `board_games/${game}/rooms/${roomId}`);
      const getJoinRejectionReason = (currentRoom) => {
        if (!currentRoom) return 'Phòng không còn tồn tại.';
        const players = currentRoom?.players || {};
        const inviteStatus = currentRoom?.inviteStatus?.[currentUser.username];
        if (currentRoom.status !== 'waiting') return `Trạng thái phòng là "${currentRoom.status}".`;
        if (!players[fromUsername]) return 'Không tìm thấy người mời trong phòng.';
        if (Object.keys(players).length !== 1) return `Phòng hiện có ${Object.keys(players).length} người chơi.`;
        if (players[currentUser.username]) return 'Tài khoản của bạn đã có trong phòng.';
        if (!currentRoom.invitedUsers?.[currentUser.username]) return 'Tài khoản của bạn không có trong danh sách được mời.';
        if (inviteStatus && inviteStatus !== 'pending') return `Trạng thái lời mời là "${inviteStatus}".`;
        return null;
      };

      const buildJoinedRoom = (currentRoom) => {
        const players = currentRoom.players || {};
        const symbol = gameInfo.colors[Object.keys(players).length];
        const updatedInviteStatus = { ...(currentRoom.inviteStatus || {}), [currentUser.username]: 'accepted' };
        Object.keys(currentRoom.invitedUsers || {}).forEach((invitedUsername) => {
          if (invitedUsername !== currentUser.username && updatedInviteStatus[invitedUsername] === 'pending') {
            updatedInviteStatus[invitedUsername] = 'expired';
          }
        });
        const joinedPlayers = {
          ...players,
          [currentUser.username]: {
            fullName: currentUser.fullName || currentUser.username,
            symbol,
            ready: true
          }
        };
        joinedPlayers[fromUsername] = { ...joinedPlayers[fromUsername], ready: true };
        return {
          ...currentRoom,
          inviteStatus: updatedInviteStatus,
          players: joinedPlayers,
          status: 'playing',
          turn: fromUsername,
          winner: null,
          resultReason: null
        };
      };

      const runJoinTransactionWithLiveRoom = () => new Promise((resolve, reject) => {
        const state = { settled: false, transactionStarted: false };
        const finish = (callback, value) => {
          if (state.settled) return;
          state.settled = true;
          clearTimeout(timeoutId);
          unsubscribe();
          callback(value);
        };
        const timeoutId = setTimeout(() => {
          finish(reject, new Error('Không nhận được dữ liệu phòng từ Firebase trong thời gian chờ.'));
        }, 10000);

        const unsubscribe = onValue(roomRef, (snapshot) => {
          if (state.settled || state.transactionStarted || !snapshot.exists()) return;
          state.transactionStarted = true;
          runTransaction(roomRef, (currentRoom) => {
            if (getJoinRejectionReason(currentRoom)) return;
            return buildJoinedRoom(currentRoom);
          }, { applyLocally: false }).then(
            (result) => finish(resolve, result),
            (error) => finish(reject, error)
          );
        }, (error) => finish(reject, error));
      });

      let joinedRoom;
      let transactionAbortReason;
      const lastValidRoomReads = [];
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const roomSnapshot = await get(roomRef);
        const currentRoom = roomSnapshot.val();
        transactionAbortReason = getJoinRejectionReason(currentRoom);
        if (transactionAbortReason) break;
        lastValidRoomReads.push(currentRoom);

        joinedRoom = await runJoinTransactionWithLiveRoom();

        if (joinedRoom.committed) break;

        const latestRoom = (await get(roomRef)).val();
        transactionAbortReason = getJoinRejectionReason(latestRoom);
        if (transactionAbortReason) break;
        transactionAbortReason = 'Giao dịch chưa hoàn tất, đang thử lại.';
      }

      if (!joinedRoom?.committed) {
        const latestRoom = (await get(roomRef)).val();
        const transactionSnapshot = joinedRoom?.snapshot?.val();
        const latestRoomRejection = getJoinRejectionReason(latestRoom);
        const transactionRoomRejection = getJoinRejectionReason(transactionSnapshot);
        const inconsistentRoomRead = !latestRoom && lastValidRoomReads.length > 0;
        transactionAbortReason = latestRoomRejection && inconsistentRoomRead
          ? 'Lần đọc trước thấy phòng hợp lệ nhưng lần đọc sau trả về rỗng; kiểm tra đúng Firebase project/database và roomPath trong console.'
          : latestRoomRejection || transactionRoomRejection ||
            'Firebase không xác nhận giao dịch dù phòng vẫn hợp lệ; kiểm tra quyền ghi Realtime Database hoặc lỗi transaction trong console.';
        console.warn('Không thể chấp nhận lời mời cờ:', {
          game,
          roomPath: `board_games/${game}/rooms/${roomId}`,
          roomId,
          fromUsername,
          invitedUsername: currentUser.username,
          reason: transactionAbortReason,
          lastValidRoomData: lastValidRoomReads[lastValidRoomReads.length - 1] || null,
          roomAtTransactionEnd: transactionSnapshot,
          latestRoom
        });
        alert(`Không thể vào phòng ${roomId} (${game}): ${transactionAbortReason}`);
        if (latestRoomRejection && !inconsistentRoomRead) {
          const currentInvite = (await get(inviteRef)).val();
          if (currentInvite?.game === game && currentInvite?.roomId === roomId) {
            await remove(inviteRef);
          }
          setBoardGameInvite(null);
        }
        return;
      }

      await revokePendingGameInvites(game, roomId, joinedRoom.snapshot.val());
      await update(ref(db), {
        [`board_games/${game}/lobby/${currentUser.username}`]: {
          username: currentUser.username,
          fullName: currentUser.fullName || currentUser.username,
          status: 'dang_dau',
          roomId,
          matchedRoomId: roomId
        },
        [`board_games/${game}/lobby/${fromUsername}/status`]: 'dang_dau'
      });
      const currentInvite = (await get(inviteRef)).val();
      if (currentInvite?.game === game && currentInvite?.roomId === roomId) {
        await remove(inviteRef);
      }
      setBoardGameInvite(null);
      setCurrentScreen(`${gameInfo.screen}_${roomId}`);
    } catch (error) {
      console.error('Lỗi khi chấp nhận lời mời chơi cờ:', error);
      alert('Không thể vào phòng lúc này, vui lòng thử lại.');
    }
  };

  const handleDeclineBoardGameInvite = async () => {
    if (!currentUser?.username) return;
    const inviteRef = ref(db, `board_game_invites/${currentUser.username}`);
    const snapshot = await get(inviteRef);
    const invite = snapshot.val();
    if (invite?.game && invite?.roomId) {
      const statusPath = `board_games/${invite.game}/rooms/${invite.roomId}/inviteStatus/${currentUser.username}`;
      const statusRef = ref(db, statusPath);
      const result = await runTransaction(statusRef, (status) => status === 'pending' ? 'declined' : undefined, { applyLocally: false });
      if (result.committed) {
        const latestInvite = (await get(inviteRef)).val();
        if (latestInvite?.game === invite.game && latestInvite?.roomId === invite.roomId) {
          await remove(inviteRef);
        }
      }
    } else {
      await remove(inviteRef);
    }
    setBoardGameInvite(null);
  };

  // Lắng nghe người đang online
  useEffect(() => {
    const onlineRef = ref(db, 'online_users');
    return onValue(onlineRef, (snapshot) => {
      setActiveUsers(snapshot.val() || {});
    });
  }, []);

  // Lắng nghe toàn bộ users (cho bảng công đức)
  useEffect(() => {
    const usersRef = ref(db, 'users');
    return onValue(usersRef, (snapshot) => {
      setAllUsers(snapshot.val() || {});
    });
  }, []);

  // Lắng nghe nhật ký chánh điện
  useEffect(() => {
    const logsRef = ref(db, 'logs');
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const logList = Object.values(data).slice(-30);
      setLogs(logList);
    }); 
    return () => unsubscribeLogs();
  }, []);

  // Hàm xử lý đăng xuất / thoát tài khoản
  const handleLogout = async () => {
    if (currentUser?.username) {
      try {
        const username = currentUser.username;
        const games = ['caro', 'chess', 'xiangqi', 'go'];
        await Promise.all(games.map(async (game) => {
          const lobbySnapshot = await get(ref(db, `board_games/${game}/lobby/${username}`));
          const roomId = lobbySnapshot.val()?.roomId;
          if (!roomId) return;

          const roomRef = ref(db, `board_games/${game}/rooms/${roomId}`);
          const roomSnapshot = await get(roomRef);
          const roomData = roomSnapshot.val();
          if (!roomData) return;

          if (roomData.status === 'waiting' && roomData.players?.[username]) {
            await runTransaction(roomRef, (currentRoom) => {
              if (!currentRoom || currentRoom.status !== 'waiting' || !currentRoom.players?.[username]) {
                return;
              }
              const players = { ...currentRoom.players };
              delete players[username];
              return {
                ...currentRoom,
                status: 'cancelled',
                resultReason: 'Người mời đã đăng xuất. Lời mời đang chờ đã được thu hồi.',
                players
              };
            }, { applyLocally: false });
          }

          const latestRoom = (await get(roomRef)).val();
          if (latestRoom) await revokePendingGameInvites(game, roomId, latestRoom);
        }));
        const onlineRef = ref(db, `online_users/${currentUser.username}`);
        await remove(onlineRef);
      } catch (error) {
        console.error('Lỗi khi thu hồi lời mời hoặc cập nhật trạng thái đăng xuất:', error);
      }
    }
    localStorage.removeItem('kps_current_user');
    setCurrentUser(null);
    setCurrentScreen('auth');
  };

  const handleLoginSuccess = (user) => {
    try {
      localStorage.setItem('kps_current_user', JSON.stringify(user));
    } catch (e) {
      console.error("Lỗi lưu localStorage:", e);
    }
    setCurrentUser(user);
    setCurrentScreen('tamquan');
  };

  if (!currentUser || currentScreen === 'auth') {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentScreen === 'tamquan') {
    return (
      <>
        <TamQuan
          currentUser={currentUser}
          onNavigate={(screen) => setCurrentScreen(screen)}
          handleLogout={handleLogout}
        />
        {renderBoardGameInvitePopup()}
      </>
    );
  }

  const totalCongDucToanCty = Object.values(allUsers).reduce(
    (sum, user) => sum + (user.totalCongDuc || 0),
    0
  );

  const renderHeader = (showBackButton = true) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      flexWrap: 'wrap',
      gap: '10px',
      backgroundColor: '#1e293b',
      padding: '8px 14px',
      borderRadius: '8px',
      border: '1px solid #334155'
    }}>
      <button 
        onClick={() => setCurrentScreen('tamquan')} 
        style={{ display: showBackButton ? 'inline-block' : 'none', padding: '6px 14px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
      >
        ← Cổng Tam Quan
      </button>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}> 
        <span style={{ fontSize: '12px', color: '#f7dfad', background: '#0f172a', padding: '5px 10px', borderRadius: '20px', border: '1px solid #384255' }}>
          🪵 KPS Tổng công đức: <b style={{ color: '#fff' }}>{totalCongDucToanCty}</b>
        </span>
      </div>

      <button 
        onClick={handleLogout} 
        style={{ padding: '6px 12px', background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
      >
        🚪 Thoát TK <b>{currentUser?.fullName}</b>
      </button>
    </div>
  );

  function renderBoardGameInvitePopup() {
    if (!boardGameInvite || currentScreen === 'TinhTamDien') return null;
    const gameNames = { caro: 'Caro', chess: 'Cờ vua', xiangqi: 'Cờ tướng', go: 'Cờ vây' };
    return (
      <div style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 10000,
        backgroundColor: '#1e293b', border: '2px solid #ffb703', padding: '15px',
        borderRadius: '12px', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#ffb703' }}>🎲 Lời mời {gameNames[boardGameInvite.game] || 'chơi cờ'}</h4>
        <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
          <b>{boardGameInvite.fromFullName}</b> mời đạo hữu vào chơi!
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleAcceptBoardGameInvite} style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Chấp nhận</button>
          <button onClick={handleDeclineBoardGameInvite} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Từ chối</button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'chanhdien') {
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        {renderHeader()}
        <ChanhDien currentUser={currentUser} activeUsers={activeUsers} allUsers={allUsers} logs={logs} />
        {renderBoardGameInvitePopup()}
      </div>
    );
  }

  if (currentScreen === 'TinhTamDien') {
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        {renderHeader()}
        <TinhTamDien currentUser={currentUser} onBack={() => setCurrentScreen('tamquan')} />
        {renderBoardGameInvitePopup()}
      </div>
    );
  }

  if (currentScreen === 'TangKinhCac') {
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        {renderHeader()}
        <TangKinhCac currentUser={currentUser} onBack={() => setCurrentScreen('tamquan')} />
        {renderBoardGameInvitePopup()}
      </div>
    );
  }

  const boardGameRoutes = [
    { prefix: 'CoCaro', Component: CoCaro },
    { prefix: 'CoVua', Component: CoVua },
    { prefix: 'CoTuong', Component: CoTuong },
    { prefix: 'covay', Component: CoVay }
  ];
  const activeBoardGame = boardGameRoutes.find(({ prefix }) =>
    currentScreen === prefix || currentScreen.startsWith(`${prefix}_`)
  );
  if (activeBoardGame) {
    const { prefix, Component } = activeBoardGame;
    const roomId = currentScreen.startsWith(`${prefix}_`) ? currentScreen.slice(prefix.length + 1) : null;
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        {renderHeader()}
        <Suspense fallback={<div style={{ color: '#fff', padding: '20px' }}>Đang mở Kỳ Viện...</div>}>
          <Component
            currentUser={currentUser}
            roomId={roomId}
            activeUsers={activeUsers}
            setNotice={(msg) => alert(msg)}
            onBack={() => setCurrentScreen('tamquan')}
            onRoomLeave={() => setCurrentScreen(prefix)}
          />
        </Suspense>
        {renderBoardGameInvitePopup()}
      </div>
    );
  }

  return null;
}