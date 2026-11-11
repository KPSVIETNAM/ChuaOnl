import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import Auth from './components/Auth';
import TamQuan from './components/TamQuan';
import ChanhDien from './components/ChanhDien'; 
import TinhTamDien from './components/TinhTamDien';
import TangKinhCac from './components/TangKinhCac';
import CoCaro from './components/CoCaro';
import { ref, onValue, remove, update } from 'firebase/database';
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('auth'); // 'auth', 'tamquan', 'chanhdien', 'TinhTamDien', 'TangKinhCac'
  
  // Dữ liệu realtime từ Firebase
  const [activeUsers, setActiveUsers] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [logs, setLogs] = useState([]); 

// State & Lắng nghe lời mời Cờ Caro riêng cho tài khoản
  const [caroInvite, setCaroInvite] = useState(null);

  useEffect(() => {
    if (!currentUser?.username) return;

    const inviteRef = ref(db, `caro_invites/${currentUser.username}`);
    const unsubscribe = onValue(inviteRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCaroInvite(data);
      } else {
        setCaroInvite(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);
// 2. TỰ ĐỘNG ĐỒNG BỘ VỊ TRÍ MÀN HÌNH LÊN FIREBASE (Thêm mới)
useEffect(() => {
  if (!currentUser?.username) return;

  const userOnlineRef = ref(db, `online_users/${currentUser.username}`);
  
  // Cập nhật màn hình hiện tại của user
  update(userOnlineRef, {
    currentScreen: currentScreen,
    lastActive: Date.now()
  }).catch(() => {}); 
}, [currentScreen, currentUser]);


  // Hàm chấp nhận lời mời Caro
  const handleAcceptInvite = async () => {
    if (!caroInvite) return;
    const roomToJoin = caroInvite.roomId || 'phong_chung';
    await remove(ref(db, `caro_invites/${currentUser.username}`));
    setCaroInvite(null);
    setCurrentScreen(`CoCaro_${roomToJoin}`);
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

    return () => {
      unsubscribeLogs();
    };
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
    setCurrentUser(null);
    setCurrentScreen('auth');
  };

  if (!currentUser || currentScreen === 'auth') {
    return <Auth onLoginSuccess={(user) => {
      setCurrentUser(user);
      setCurrentScreen('tamquan');
    }} />;
  }

  if (currentScreen === 'tamquan') {
    return <TamQuan currentUser={currentUser} onNavigate={(screen) => setCurrentScreen(screen)} />;
  }

  // Tính tổng công đức toàn hệ thống
  const totalCongDucToanCty = Object.values(allUsers).reduce(
    (sum, user) => sum + (user.totalCongDuc || 0),
    0
  );

  // Thanh điều hướng dùng chung cho cả Chánh Điện, Tịnh Tâm Điện và Tàng Kinh Các
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
        🚪 Thoát tài khoản
      </button>
    </div>
  );

  // Popup hiển thị lời mời Caro (Dùng chung cho các màn hình bên trong)
    const renderCaroInvitePopup = () => (
      caroInvite && (
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
      )
    );
  // 1. Màn hình Chánh Điện
  if (currentScreen === 'chanhdien') {
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box' }}>
        {renderHeader()}
        <ChanhDien 
          currentUser={currentUser} 
          activeUsers={activeUsers} 
          allUsers={allUsers} 
          logs={logs} 
        />
      </div>
    );
  }

  // 2. Màn hình Tịnh Tâm Điện
  if (currentScreen === 'TinhTamDien') {
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box' }}>
        {renderHeader()}
        <TinhTamDien 
          currentUser={currentUser} 
          onBack={() => setCurrentScreen('tamquan')} 
        />
      </div>
    );
  }

  // 3. Màn hình Tàng Kinh Các
  if (currentScreen === 'TangKinhCac') {
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box' }}>
        {renderHeader()}
        <TangKinhCac 
          currentUser={currentUser} 
          onBack={() => setCurrentScreen('tamquan')} 
        />
      </div>
    );
  }
  // 4. Màn hình Cờ Caro  
  if (currentScreen.startsWith('CoCaro')) {
    const roomId = currentScreen.split('_')[1];
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box' }}>
        {renderHeader()}
        <CoCaro 
          currentUser={currentUser}
          roomId={roomId}
          onBack={() => setCurrentScreen('tamquan')}
        />
      </div>
    );
  }
 // 4. Màn hình Cờ Caro 
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
 