import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import Auth from './components/Auth';
import TamQuan from './components/TamQuan';
import ChanhDien from './components/ChanhDien'; 
import TinhTamDien from './components/TinhTamDien';
import TangKinhCac from './components/TangKinhCac';
import CoCaro from './components/CoCaro';

import { ref, onValue, remove, update, get, set } from 'firebase/database';

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

  // State & Lắng nghe lời mời Cờ Caro riêng cho tài khoản
  const [caroInvite, setCaroInvite] = useState(null);

  // Tự động đồng bộ vị trí màn hình hiện tại lên Firebase Realtime Database
  useEffect(() => {
    if (!currentUser?.username) return;
    const userOnlineRef = ref(db, `online_users/${currentUser.username}`);

  // Cập nhật đè trường currentScreen và thời gian hoạt động mới nhất
    update(userOnlineRef, {
      username: currentUser.username,
      fullName: currentUser.fullName || currentUser.username,
      gender: currentUser.gender || 'khac',
      currentScreen: currentScreen,
      lastActive: Date.now()
    }).catch((err) => console.error("Lỗi cập nhật vị trí:", err));
  }, [currentScreen, currentUser]);

  // Lắng nghe lời mời Cờ Caro đến tài khoản của mình
  useEffect(() => {
    if (!currentUser?.username) return;
    const inviteRef = ref(db, `caro_invites/${currentUser.username}`);
    return onValue(inviteRef, (snapshot) => {
      setCaroInvite(snapshot.val());
    });
  }, [currentUser]);

  // Hàm chấp nhận lời mời Caro (ĐÃ VÁ LỖI TỰ ĐỘNG THÊM VÀO PHÒNG CHO NGƯỜI NHẬN MỜI)
  const handleAcceptInvite = async () => {
    if (!caroInvite) return;
    const roomToJoin = caroInvite.roomId;
    const inviterUsername = caroInvite.fromUsername;

    try {
      // 1. Kiểm tra trạng thái online hiện tại của người mời từ Firebase
      const inviterOnlineSnap = await get(ref(db, `online_users/${inviterUsername}`));
      const inviterData = inviterOnlineSnap.exists() ? inviterOnlineSnap.val() : null;

      // Kiểm tra xem người mời còn ở trang Caro hay không
      const inviterScreen = inviterData?.currentScreen || '';
      const isInviterInCaro = inviterScreen === 'caro' || inviterScreen.startsWith('CoCaro');

      // 2. Lấy dữ liệu phòng cờ để kiểm tra trạng thái ván đấu
      const roomRef = ref(db, `caro_rooms/${roomToJoin}`);
      const roomSnap = await get(roomRef);
      const roomData = roomSnap.exists() ? roomSnap.val() : null;

      // Điều kiện hủy lời mời: Người mời rời trang Caro HOẶC phòng đã chuyển sang 'playing' / 'cancelled' / không tồn tại
      if (!isInviterInCaro || !roomData || roomData.status !== 'waiting') {
        alert("⚠️ Lời mời đã hết hạn hoặc người mời không còn ở phòng chờ!");
        await remove(ref(db, `caro_invites/${currentUser.username}`));
        setCaroInvite(null);
        return;
      }

      // 3. Nếu đủ điều kiện, add người nhận vào phòng với quân 'O' và bắt đầu ván đấu
      const players = roomData.players || {};
      const updatedPlayers = {
        ...players,
        [currentUser.username]: {
          fullName: currentUser.fullName || currentUser.username,
          ready: true,
          symbol: 'O',
          ruleRequest: false
        }
      };

      const playerKeys = Object.keys(updatedPlayers);
      await update(roomRef, {
        players: updatedPlayers,
        status: 'playing',
        turn: playerKeys[0] // Người mời (X) đi trước
      });

      // Xóa lời mời sau khi chấp nhận thành công
      await remove(ref(db, `caro_invites/${currentUser.username}`));
      setCaroInvite(null);

      // Chuyển người nhận sang màn hình Caro phòng này
      setCurrentScreen(`CoCaro_${roomToJoin}`);

    } catch (err) {
      console.error("Lỗi khi chấp nhận lời mời:", err);
      alert("Cơ sở dữ liệu bận, vui lòng thử lại!");
    }
  };

  // Hàm từ chối lời mời Caro
  const handleDeclineInvite = async () => {
    if (!caroInvite) return;
    await remove(ref(db, `caro_invites/${currentUser.username}`));
    setCaroInvite(null);
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
      const logList = Object.values(data).slice(-30); // Lấy 30 log gần nhất
      setLogs(logList);
    }); 
    return () => unsubscribeLogs();
  }, []);

  // Hàm xử lý đăng xuất / thoát tài khoản
  const handleLogout = async () => {
    if (currentUser?.username) {
      try {
        const onlineRef = ref(db, `online_users/${currentUser.username}`);
        await remove(onlineRef);
      } catch (error) {
        console.error("Lỗi khi xóa trạng thái online:", error);
      }
    }
    // Xóa dữ liệu đăng nhập khỏi bộ nhớ máy
    localStorage.removeItem('kps_current_user');
    setCurrentUser(null);
    setCurrentScreen('auth');
  };

  // Hàm xử lý khi Đăng nhập thành công từ Auth.jsx
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
    return <TamQuan currentUser={currentUser} onNavigate={(screen) => setCurrentScreen(screen)} />;
  }

  // Tính tổng công đức toàn hệ thống
  const totalCongDucToanCty = Object.values(allUsers).reduce(
    (sum, user) => sum + (user.totalCongDuc || 0),
    0
  );

  // Thanh điều hướng dùng chung
  const renderHeader = () => (
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
      {/* Nút quay lại Tam Quan */}
      <button 
        onClick={() => setCurrentScreen('tamquan')} 
        style={{ padding: '6px 14px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
      >
        ← Cổng Tam Quan
      </button>

      {/* Thông số thống kê */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}> 
        <span style={{ fontSize: '12px', color: '#f7dfad', background: '#0f172a', padding: '5px 10px', borderRadius: '20px', border: '1px solid #384255' }}>
          🪵KPS Tổng công đức: <b style={{ color: '#fff' }}>{totalCongDucToanCty}</b>
        </span>
      </div>

      {/* Nút thoát tài khoản */}
      <button 
        onClick={handleLogout} 
        style={{ padding: '6px 12px', background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
      >
        🚪 Thoát TK <b>{currentUser?.fullName}</b>
      </button>
    </div>
  );

  // Popup hiển thị lời mời Caro
  const renderCaroInvitePopup = () => {
    if (!caroInvite || currentScreen === 'TinhTamDien') return null;

    return (
      <div style={{
        position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999,
        backgroundColor: '#1e293b', border: '2px solid #ffb703', padding: '15px',
        borderRadius: '12px', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#ffb703' }}>⚔️ Thách đấu Cờ Caro!</h4>
        <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
          <b>{caroInvite.fromFullName}</b> mời đạo hữu vào chơi cờ!
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleAcceptInvite} style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Chấp nhận</button>
          <button onClick={handleDeclineInvite} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Từ chối</button>
        </div>
      </div>
    );
  };

  // 1. Màn hình Chánh Điện
  if (currentScreen === 'chanhdien') {
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        {renderHeader()}
        <ChanhDien currentUser={currentUser} activeUsers={activeUsers} allUsers={allUsers} logs={logs} />
        {renderCaroInvitePopup()}
      </div>
    );
  }

  // 2. Màn hình Tịnh Tâm Điện
  if (currentScreen === 'TinhTamDien') {
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        {renderHeader()}
        <TinhTamDien currentUser={currentUser} onBack={() => setCurrentScreen('tamquan')} />
        {renderCaroInvitePopup()}
      </div>
    );
  }

  // 3. Màn hình Tàng Kinh Các
  if (currentScreen === 'TangKinhCac') {
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        {renderHeader()}
        <TangKinhCac currentUser={currentUser} onBack={() => setCurrentScreen('tamquan')} />
        {renderCaroInvitePopup()}
      </div>
    );
  }

  // 4. Màn hình Cờ Caro (Gộp chung tất cả các trường hợp bắt đầu bằng CoCaro)
  if (currentScreen === 'CoCaro' || currentScreen.startsWith('CoCaro_')) {
    const roomId = currentScreen.includes('_') ? currentScreen.split('_')[1] : 'phong_chung';
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
        {renderHeader()}
        <CoCaro 
          currentUser={currentUser}
          roomId={roomId}
          activeUsers={activeUsers}
          setNotice={(msg) => alert(msg)}
          onBack={() => setCurrentScreen('tamquan')}
        />
        {renderCaroInvitePopup()}
      </div>
    );
  }

  return null;
}