import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, set, update, push, onValue, remove, runTransaction } from 'firebase/database';

const BOARD_SIZE = 15;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

export default function CoCaro({ currentUser, activeUsers = {}, setNotice, onBack, roomId: initialRoomId }) {
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';

  const [roomId, setRoomId] = useState(initialRoomId || 'phong_chung');
  const [roomData, setRoomData] = useState(null);
  const [allLobbyPlayers, setAllLobbyPlayers] = useState({}); 
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [myStatus, setMyStatus] = useState('dang_doi');
  const [myStats, setMyStats] = useState({ wins: 0, losses: 0, winRate: 0 });

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef(null);

  // 1. Cập nhật trạng thái user online & lấy thống kê ván đấu cá nhân
  useEffect(() => {
    if (!username) return;
    const userOnlineRef = ref(db, `online_users/${username}`);
    update(userOnlineRef, { currentScreen: 'caro', caroStatus: 'dang_doi', fullName });

    const lobbyUserRef = ref(db, `caro_lobby/${username}`);
    set(lobbyUserRef, { username, fullName, status: 'dang_doi', roomId: 'phong_chung' });

    const statsRef = ref(db, `users/${username}/caroStats`);
    const unsubStats = onValue(statsRef, (snapshot) => {
      const data = snapshot.val() || { wins: 0, losses: 0 };
      const total = (data.wins || 0) + (data.losses || 0);
      const rate = total > 0 ? Math.round((data.wins / total) * 100) : 0;
      setMyStats({ wins: data.wins || 0, losses: data.losses || 0, winRate: rate });
    });

    return () => {
      update(userOnlineRef, { currentScreen: 'idle' });
      remove(lobbyUserRef);
      unsubStats();
    };
  }, [username, fullName]);

  // 2. Lắng nghe danh sách sảnh & TỰ ĐỘNG GHÉP ĐÔI TRỰC TIẾP VÀO PHÒNG
  useEffect(() => {
    const lobbyRef = ref(db, 'caro_lobby');
    const unsub = onValue(lobbyRef, async (snapshot) => {
      const lobbyData = snapshot.val() || {};
      setAllLobbyPlayers(lobbyData);

      if (myStatus === 'dang_tim_ghep') {
        const otherSearchingUserKey = Object.keys(lobbyData).find(
          (u) => u !== username && lobbyData[u].status === 'dang_tim_ghep' && !lobbyData[u].matchedRoomId
        );

        if (otherSearchingUserKey) {
          if (username < otherSearchingUserKey) {
            const newRoomId = `phong_${Date.now()}`;
            const opponent = lobbyData[otherSearchingUserKey];

            await set(ref(db, `caro_rooms/${newRoomId}`), {
              players: {
                [username]: { fullName, ready: false, symbol: 'X', ruleRequest: false },
                [opponent.username]: { fullName: opponent.fullName, ready: false, symbol: 'O', ruleRequest: false }
              },
              board: Array(TOTAL_CELLS).fill(''),
              turn: '',
              status: 'waiting',
              blockRule: false,
              winningLine: []
            });

            await update(ref(db, `caro_lobby/${username}`), { status: 'dang_dau', roomId: newRoomId, matchedRoomId: newRoomId });
            await update(ref(db, `caro_lobby/${opponent.username}`), { status: 'dang_dau', roomId: newRoomId, matchedRoomId: newRoomId });

            setMyStatus('dang_dau');
            setRoomId(newRoomId); 
          }
        }
      }
    });
    return () => unsub();
  }, [myStatus, username, fullName]);

  useEffect(() => {
    const myLobbyRef = ref(db, `caro_lobby/${username}`);
    const unsub = onValue(myLobbyRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.matchedRoomId && data.matchedRoomId !== roomId) {
        setRoomId(data.matchedRoomId);
        setMyStatus('dang_dau');
      }
    });
    return () => unsub();
  }, [username, roomId]);

  // 3. Lắng nghe phòng cờ hiện tại
  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `caro_rooms/${roomId}`);
    const unsub = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() || {};
      setRoomData(data);

      if (data.chat) {
        const msgs = Object.entries(data.chat).map(([id, m]) => ({ id, ...m }));
        setChatMessages(msgs);
      } else {
        setChatMessages([]);
      }

      if (data.status === 'playing' && data.players) {
        const playerKeys = Object.keys(data.players);
        if (playerKeys.length === 2) {
          const opponentKey = playerKeys.find(k => k !== username);
          if (opponentKey && activeUsers && !activeUsers[opponentKey]) {
            update(roomRef, {
              status: 'cancelled',
              winner: 'Hủy trận',
              winReason: 'Đối phương đã rời trận. Ván đấu được hủy, không tính điểm.'
            });
            setMyStatus('dang_doi');
            update(ref(db, `caro_lobby/${username}`), { status: 'dang_doi', matchedRoomId: null });
          }
        }
      }
    });
    return () => unsub();
  }, [roomId, activeUsers, username]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleRandomMatch = async () => {
    setMyStatus('dang_tim_ghep');
    await update(ref(db, `caro_lobby/${username}`), { status: 'dang_tim_ghep', matchedRoomId: null }); 
  };

  const handleCancelMatch = async () => {
    setMyStatus('dang_doi');
    await update(ref(db, `caro_lobby/${username}`), { status: 'dang_doi', matchedRoomId: null }); 
  };

  // Nút Thoát Trận
  const handleLeaveRoom = async () => {
    if (roomId && roomId !== 'phong_chung') {
      const roomRef = ref(db, `caro_rooms/${roomId}`);
      if (roomData && roomData.status === 'playing') {
        // Nếu đang chơi mà thoát -> xử lý hủy trận hoặc xử lý đối thủ thắng tùy logic
        await update(roomRef, {
          status: 'cancelled',
          winner: 'Hủy trận',
          winReason: `${fullName} đã rời trận. Ván đấu kết thúc.`
        });
      }
    }
    setMyStatus('dang_doi');
    await update(ref(db, `caro_lobby/${username}`), { status: 'dang_doi', matchedRoomId: null });
    setRoomId('phong_chung');
    setRoomData(null);
    if (onBack) onBack();
  };

  const handleToggleReady = async () => {
    if (!roomData) return;
    const isReady = roomData.players?.[username]?.ready || false;
    const players = roomData.players || {};
    
    const updatedPlayers = {
      ...players,
      [username]: { ...players[username], ready: !isReady }
    };

    const playerKeys = Object.keys(updatedPlayers);
    const allReady = playerKeys.length === 2 && playerKeys.every(k => updatedPlayers[k].ready);

    await update(ref(db, `caro_rooms/${roomId}`), {
      players: updatedPlayers,
      status: allReady ? 'playing' : 'waiting',
      turn: allReady ? playerKeys[0] : ''
    });
  };

  const handleToggleRuleRequest = async () => {
    if (!roomData) return;
    const players = roomData.players || {};
    const currentRuleReq = players[username]?.ruleRequest || false;
    
    const updatedPlayers = {
      ...players,
      [username]: { ...players[username], ruleRequest: !currentRuleReq }
    };

    const playerKeys = Object.keys(updatedPlayers);
    const bothAgreed = playerKeys.length === 2 && playerKeys.every(k => updatedPlayers[k]?.ruleRequest);

    let updates = { players: updatedPlayers };
    if (bothAgreed) {
      updates.blockRule = !roomData.blockRule;
      playerKeys.forEach(k => {
        updatedPlayers[k].ruleRequest = false;
      });
    }

    await update(ref(db, `caro_rooms/${roomId}`), updates);
  };

   const handleInviteUser = async (targetUsername, targetUserObj) => {
    const isMeditating = targetUserObj?.currentScreen === 'TinhTamDien' || targetUserObj?.status?.includes('tịnh tâm');
    if (isMeditating) {
      if (setNotice) setNotice(`Đạo hữu ${targetUserObj.fullName || targetUsername} đang tịnh tâm, không thể quấy rầy! 🧘`);
      setShowInviteModal(false);
      return;
    }

    const newRoomId = `phong_${Date.now()}`;

    // Tạo phòng chờ trên Firebase
    await set(ref(db, `caro_rooms/${newRoomId}`), {
      players: {
        [username]: { fullName, ready: true, symbol: 'X', ruleRequest: false }
      },
      board: Array(TOTAL_CELLS).fill(''),
      status: 'waiting',
      blockRule: false,
      winningLine: []
    });

    // Gửi lời mời kèm roomId sang cho người nhận
    await set(ref(db, `caro_invites/${targetUsername}`), {
      fromUsername: username,
      fromFullName: fullName,
      roomId: newRoomId,
      timestamp: Date.now()
    });

    setShowInviteModal(false);
    
    // THAY ĐỔI: Người mời sẽ tự động nhảy vào phòng và hiển thị trạng thái đang đợi đối phương vào
    setRoomId(newRoomId);
    setMyStatus('dang_dau');
    
    if (setNotice) setNotice(`Đã gửi lời mời tới ${targetUserObj.fullName || targetUsername}. Đang đợi chấp nhận...`);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    push(ref(db, `caro_rooms/${roomId}/chat`), {
      sender: fullName,
      username,
      text: text.slice(0, 300),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });
    setChatInput('');
  };

  const recordGameResult = async (winnerName, loserName) => {
    if (!winnerName || !loserName) return;
    runTransaction(ref(db, `users/${winnerName}/caroStats/wins`), (c) => (c || 0) + 1);
    runTransaction(ref(db, `users/${loserName}/caroStats/losses`), (c) => (c || 0) + 1);
  };

  const checkWinAndGetLine = (board, idx, symbol, blockRule) => {
    const row = Math.floor(idx / BOARD_SIZE);
    const col = idx % BOARD_SIZE;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (let [dx, dy] of directions) {
      let line = [idx];
      
      let r = row + dx;
      let c = col + dy;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r * BOARD_SIZE + c] === symbol) {
        line.push(r * BOARD_SIZE + c);
        r += dx;
        c += dy;
      }
      let forwardBlocked = (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || (board[r * BOARD_SIZE + c] !== '' && board[r * BOARD_SIZE + c] !== symbol));

      r = row - dx;
      c = col - dy;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r * BOARD_SIZE + c] === symbol) {
        line.push(r * BOARD_SIZE + c);
        r -= dx;
        c -= dy;
      }
      let backwardBlocked = (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || (board[r * BOARD_SIZE + c] !== '' && board[r * BOARD_SIZE + c] !== symbol));

      if (line.length >= 5) {
        if (blockRule && forwardBlocked && backwardBlocked) {
          continue; 
        }
        return line;
      }
    }
    return null;
  };

  const handleCellClick = async (index) => {
    if (!roomData || roomData.status !== 'playing') return;
    if (roomData.turn !== username) return;
    if (roomData.board[index] !== '') return;

    const mySymbol = roomData.players[username]?.symbol || 'X';
    const newBoard = [...roomData.board];
    newBoard[index] = mySymbol;

    const otherPlayer = Object.keys(roomData.players).find(k => k !== username);
    const winningLine = checkWinAndGetLine(newBoard, index, mySymbol, roomData.blockRule);
    const isWin = winningLine !== null;

    const filledCount = newBoard.filter(cell => cell !== '').length;
    const remainingCells = TOTAL_CELLS - filledCount;
    const isDraw = !isWin && filledCount >= TOTAL_CELLS;

    let newStatus = 'playing';
    let winnerName = null;

    if (isWin) {
      newStatus = 'finished';
      winnerName = fullName;
      recordGameResult(username, otherPlayer);
    } else if (isDraw) {
      newStatus = 'finished';
      winnerName = 'Hòa (Draw)';
    }

    await update(ref(db, `caro_rooms/${roomId}`), {
      board: newBoard,
      turn: isWin || isDraw ? '' : otherPlayer,
      status: newStatus,
      winner: winnerName,
      winningLine: winningLine || [],
      remainingCells: remainingCells
    });

    if (isWin || isDraw) {
      setMyStatus('dang_doi');
      await update(ref(db, `caro_lobby/${username}`), { status: 'dang_doi' });
    }
  };

  const handleRequestRematch = async () => {
    if (!roomData) return;
    const players = roomData.players || {};
    const updatedPlayers = {
      ...players,
      [username]: { ...players[username], rematchRequested: true }
    };

    const playerKeys = Object.keys(updatedPlayers);
    const bothRematch = playerKeys.length === 2 && playerKeys.every(k => updatedPlayers[k]?.rematchRequested);

    if (bothRematch) {
      const firstUser = playerKeys[0];
      const secondUser = playerKeys[1];
      const resetPlayers = {
        [firstUser]: { ...players[firstUser], ready: true, symbol: 'X', rematchRequested: false },
        [secondUser]: { ...players[secondUser], ready: true, symbol: 'O', rematchRequested: false }
      };

      await update(ref(db, `caro_rooms/${roomId}`), {
        board: Array(TOTAL_CELLS).fill(''),
        players: resetPlayers,
        status: 'playing',
        turn: firstUser,
        winner: null,
        winReason: null,
        winningLine: [],
        remainingCells: null
      });
      setMyStatus('dang_dau');
    } else {
      await update(ref(db, `caro_rooms/${roomId}`), {
        players: updatedPlayers
      }); 
    }
  };

  const players = roomData?.players || {};
  const isMyReady = players[username]?.ready || false;
  const isMyRuleReq = players[username]?.ruleRequest || false;
  const opponentUsername = Object.keys(players).find(k => k !== username);
  const opponentData = opponentUsername ? players[opponentUsername] : null;
  const isOpponentRuleReq = opponentData?.ruleRequest || false;
  const isRematchRequested = players[username]?.rematchRequested || false;
  const winningLine = roomData?.winningLine || [];
  const blockRule = roomData?.blockRule || false;

  const renderStatusLabel = (st) => {
    if (st === 'dang_tim_ghep') return <span style={{ color: '#38bdf8' }}>🔍 Đang tìm ghép đôi</span>;
    if (st === 'dang_dau') return <span style={{ color: '#ef4444' }}>⚔️ Đang đấu cờ</span>;
    return <span style={{ color: '#10b981' }}>🟢 Đang đợi / Rảnh</span>;
  };

  return (
    <div className="caro-container">
      <div className="caro-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleLeaveRoom} className="leave-room-btn">🚪 Thoát trận</button>
          <h2 style={{ color: '#ffb703', margin: 0 }}>⚔️ KỲ VIỆN CỜ CARO ⚔️</h2>
        </div>
        
        <div className="my-stats-badge">
          🏆 Thắng: <b>{myStats.wins}</b> | Tỷ lệ: <b style={{ color: '#38bdf8' }}>{myStats.winRate}%</b>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}> 
          {myStatus === 'dang_tim_ghep' ? (
            <button onClick={handleCancelMatch} className="cancel-match-btn">Hủy tìm ghép</button>
          ) : (
            <button onClick={handleRandomMatch} className="random-match-btn">🎲 Ghép Ngẫu Nhiên</button>
          )}
          <button onClick={() => setShowInviteModal(true)} className="invite-btn">✉️ Mời</button>
        </div>
      </div>

      <div className="lobby-status-panel">
        <h4 style={{ margin: '0 0 6px 0', color: '#f7dfad', fontSize: '11px' }}>📋 Danh sách Kỳ Thủ tại Kỳ Viện:</h4>
        <div className="lobby-players-grid">
          {Object.entries(allLobbyPlayers)
          .filter(([u]) => u !== username)
          .map(([u, p]) => (
            <div key={u} className="lobby-player-pill">
              <b>{p.fullName}</b>: {renderStatusLabel(p.status)}
            </div>
          ))}
        </div>
      </div>

      <div className="caro-status-bar">
        <div className="players-info">
          {Object.keys(players).length === 0 ? (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Phòng trống, hãy bấm Ghép Ngẫu Nhiên hoặc Mời đạo hữu!</span>
          ) : (
            Object.entries(players).map(([uname, p]) => (
              <span key={uname} className={`player-badge ${p.ready ? 'ready' : ''}`}>
                {p.symbol === 'X' ? '❌' : '⭕'} {p.fullName} {p.ready ? '(Đã sẵn sàng)' : '(Chưa sẵn sàng)'}
              </span>
            ))
          )}
        </div>

        {Object.keys(players).length === 2 && (
          <div className="rule-box">
            <div style={{ fontSize: '9px', color: '#cbd5e1', marginBottom: '2px' }}>
              Chặn 2 đầu: <b style={{ color: blockRule ? '#ef4444' : '#10b981' }}>{blockRule ? 'BẬT' : 'TẮT'}</b>
            </div>
            <button onClick={handleToggleRuleRequest} className={`rule-btn ${isMyRuleReq ? 'active' : ''}`}>
              {isMyRuleReq ? '✅ Đã đồng ý đổi' : '⚙️ Đổi luật (2 bên)'}
            </button>
            {isOpponentRuleReq && !isMyRuleReq && (
              <div style={{ fontSize: '9px', color: '#38bdf8', marginTop: '1px' }}>Đối phương muốn đổi luật!</div>
            )}
          </div>
        )}

        {roomData?.status === 'waiting' && Object.keys(players).length > 0 && (
          <button onClick={handleToggleReady} className={`ready-btn ${isMyReady ? 'is-ready' : ''}`}>
            {isMyReady ? '⚡ HỦY SẴN SÀNG' : '⚡ SẴN SÀNG'}
          </button>
        )}

        {roomData?.status === 'playing' && (
          <div className="turn-notice">
            Lượt đi: <b>{roomData.turn === username ? 'BẠN' : roomData.players?.[roomData.turn]?.fullName}</b>
          </div>
        )}

        {/* Khung Kết Quả Đã Được Thu Gọn Gàng */}
        {roomData?.status === 'finished' && (
          <div className="win-notice-box-compact">
            <div className="win-text">
              🎉 <b>{roomData.winner === 'Hòa (Draw)' ? '🤝 HÒA!' : `${roomData.winner} THẮNG!`}</b>
              {roomData.remainingCells !== undefined && <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '6px' }}>(Còn {roomData.remainingCells} ô)</span>}
            </div>
            <button 
              onClick={handleRequestRematch} 
              disabled={isRematchRequested}
              className={`rematch-btn-compact ${isRematchRequested ? 'requested' : ''}`}
            >
              {isRematchRequested ? '⏳ Đang chờ...' : '🔄 Chơi lại'}
            </button>
          </div>
        )}

        {roomData?.status === 'cancelled' && (
          <div style={{ color: '#f87171', fontSize: '11px', fontWeight: 'bold' }}>
            ⚠️ {roomData.winReason || 'Ván đấu đã bị hủy.'}
          </div>
        )}
      </div>

      <div className="caro-main-layout">
        <div className="caro-board">
          {roomData?.board ? (
            roomData.board.map((cell, idx) => {
              const isWinningCell = winningLine.includes(idx);
              return (
                <button 
                  key={idx} 
                  className={`caro-cell ${cell} ${isWinningCell ? 'winning-cell' : ''}`}
                  onClick={() => handleCellClick(idx)}
                  disabled={roomData.status !== 'playing'}
                >
                  {cell}
                </button>
              );
            })
          ) : (
            Array(TOTAL_CELLS).fill('').map((_, idx) => (
              <div key={idx} className="caro-cell"></div>
            ))
          )}
        </div>

        <div className="caro-chat-box">
          <div className="caro-chat-title">💬 Trò chuyện phòng cờ</div>
          <div className="caro-chat-messages" ref={chatScrollRef}>
            {chatMessages.length === 0 ? (
              <div className="chat-empty">Chưa có tin nhắn trong phòng.</div>
            ) : (
              chatMessages.map((msg) => {
                const isMine = msg.username === username;
                return (
                  <div key={msg.id} className={`caro-msg ${isMine ? 'my-msg' : ''}`}>
                    <div className="caro-msg-meta">
                      <strong>{msg.sender}</strong>
                      <time>{msg.time}</time>
                    </div>
                    <div className="caro-msg-bubble">{msg.text}</div>
                  </div>
                );
              })
            )}
          </div>
          <form className="caro-chat-form" onSubmit={handleSendChat}>
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Nhập tin nhắn..." 
              maxLength={300}
            />
            <button type="submit">Gửi</button>
          </form>
        </div>
      </div>

      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>✉️ Danh sách Đạo Hữu Online</h3>
            <div className="online-list">
              {activeUsers && Object.keys(activeUsers).filter(u => u !== username).length > 0 ? (
                Object.entries(activeUsers)
                  .filter(([u]) => u !== username)
                  .map(([u, userObj]) => {
                    const isMeditating = userObj?.currentScreen === 'TinhTamDien' || userObj?.status?.includes('tịnh tâm');
                    const displayName = userObj?.fullName || u;
                    const currentLoc = userObj?.currentScreen ? `(Đang ở: ${userObj.currentScreen})` : '(Online)';
                    return (
                      <div key={u} className="online-item">
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 'bold', color: '#fff' }}>{displayName}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                            {currentLoc} {isMeditating ? '🧘 (Đang tịnh tâm)' : ''}
                          </div>
                        </div>
                        <button 
                          disabled={isMeditating}
                          onClick={() => handleInviteUser(u, userObj)}
                          className={`send-invite-btn ${isMeditating ? 'disabled' : ''}`}
                        >
                          {isMeditating ? 'Bận' : 'Thách đấu'}
                        </button>
                      </div>
                    );
                  })
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                  Không có đạo hữu nào khác đang online.
                </div>
              )}
            </div>
            <button onClick={() => setShowInviteModal(false)} className="close-btn">Đóng</button>
          </div>
        </div>
      )}

      <style>{`
        .caro-container { max-width: 1000px; margin: 0 auto; padding: 15px; background: #171d2b; border-radius: 16px; color: #fff; text-align: center; }
        .caro-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
        .my-stats-badge { background: #1e293b; padding: 5px 10px; border-radius: 20px; font-size: 11px; border: 1px solid #334155; color: #f7dfad; }
        .invite-btn { padding: 6px 12px; background: #b45309; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 11px; }
        .random-match-btn { padding: 6px 12px; background: #059669; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 11px; }
        .cancel-match-btn { padding: 6px 12px; background: #dc2626; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 11px; }
        .leave-room-btn { padding: 6px 12px; background: #475569; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 11px; }
        .leave-room-btn:hover { background: #64748b; }
        
        .lobby-status-panel { background: #1e293b; padding: 8px 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #334155; text-align: left; }
        .lobby-players-grid { display: flex; flex-wrap: wrap; gap: 6px; max-height: 70px; overflow-y: auto; }
        .lobby-player-pill { background: #0f172a; padding: 3px 8px; border-radius: 6px; font-size: 10px; border: 1px solid #384255; }

        .caro-status-bar { background: #202737; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .player-badge { padding: 3px 8px; background: #334155; border-radius: 20px; font-size: 11px; }
        .player-badge.ready { background: #065f46; color: #a7f3d0; }
        .ready-btn { padding: 6px 14px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 11px; }
        .ready-btn.is-ready { background: #dc2626; }
        
        .rule-box { background: #1e293b; padding: 4px 8px; border-radius: 6px; border: 1px solid #334155; text-align: center; }
        .rule-btn { padding: 3px 8px; background: #475569; color: #fff; border: none; border-radius: 4px; font-size: 9px; font-weight: bold; cursor: pointer; margin-top: 1px; }
        .rule-btn.active { background: #059669; }

        /* Khung kết quả thu gọn */
        .win-notice-box-compact { display: flex; align-items: center; gap: 10px; background: #1e293b; padding: 4px 10px; border-radius: 6px; border: 1px solid #f59e0b; }
        .win-text { font-size: 11px; color: #fbbf24; }
        .rematch-btn-compact { padding: 4px 10px; background: #d97706; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 10px; }
        .rematch-btn-compact.requested { background: #475569; cursor: not-allowed; }

        .caro-main-layout { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
        .caro-board { display: grid; grid-template-columns: repeat(15, 1fr); gap: 2px; background: #34394a; padding: 4px; border-radius: 8px; width: 100%; max-width: 500px; aspect-ratio: 1; }
        .caro-cell { background: #1e293b; border: none; font-size: 13px; font-weight: bold; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .caro-cell:hover { background: #334155; }
        .caro-cell.X { color: #ef4444; }
        .caro-cell.O { color: #3b82f6; }
        
        .caro-cell.winning-cell { background: #fbbf24 !important; color: #000 !important; animation: pulseWin 0.8s infinite alternate; }
        @keyframes pulseWin {
          from { transform: scale(1); box-shadow: 0 0 4px #fbbf24; }
          to { transform: scale(1.08); box-shadow: 0 0 10px #f59e0b; z-index: 10; }
        }

        .caro-chat-box { width: 280px; height: 500px; background: #202737; border: 1px solid #34394a; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; text-align: left; }
        .caro-chat-title { padding: 8px 12px; background: #171f2d; font-size: 12px; font-weight: bold; color: #ffb703; border-bottom: 1px solid #334155; }
        .caro-chat-messages { flex: 1; padding: 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; font-size: 11px; }
        .caro-msg { max-width: 85%; align-self: flex-start; }
        .caro-msg.my-msg { align-self: flex-end; }
        .caro-msg-meta { display: flex; gap: 6px; margin-bottom: 2px; font-size: 9px; color: #94a3b8; }
        .caro-msg-meta strong { color: #f7dfad; }
        .caro-msg-bubble { padding: 5px 8px; background: #334155; color: #f1f5f9; border-radius: 6px; line-height: 1.3; word-break: break-word; }
        .caro-msg.my-msg .caro-msg-bubble { background: #b45309; color: #fff; }
        .chat-empty { text-align: center; color: #94a3b8; margin: auto; }
        .caro-chat-form { display: flex; padding: 6px; background: #171f2d; border-top: 1px solid #334155; gap: 6px; }
        .caro-chat-form input { flex: 1; padding: 5px 8px; background: #1e293b; border: 1px solid #475569; border-radius: 6px; color: #fff; font-size: 11px; outline: none; }
        .caro-chat-form button { padding: 5px 10px; background: #b45309; color: #fff; border: none; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #1e293b; padding: 18px; border-radius: 12px; width: 90%; max-width: 380px; text-align: left; }
        .online-list { max-height: 220px; overflow-y: auto; margin: 12px 0; display: flex; flex-direction: column; gap: 6px; }
        .online-item { display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 6px 10px; border-radius: 6px; font-size: 12px; }
        .send-invite-btn { padding: 3px 8px; background: #059669; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px; }
        .send-invite-btn.disabled { background: #475569; cursor: not-allowed; }
        .close-btn { width: 100%; padding: 6px; background: #334155; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }
      `}</style>
    </div>
  );
}