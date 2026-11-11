import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, remove } from 'firebase/database';
import Auth from './components/Auth';
import TamQuan from './components/TamQuan';
import ChanhDien from './components/ChanhDien'; 
import TinhTamDien from './components/TinhTamDien';
import TangKinhCac from './components/TangKinhCac';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('auth'); // 'auth', 'tamquan', 'chanhdien', 'TinhTamDien', 'TangKinhCac'
  
  // Dữ liệu realtime từ Firebase
  const [activeUsers, setActiveUsers] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [logs, setLogs] = useState([]); 

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

  return null;
}