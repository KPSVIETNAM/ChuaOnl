import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, remove } from 'firebase/database';
import Auth from './components/Auth';
import TamQuan from './components/TamQuan';
import ChanhDien from './components/ChanhDien';
// import TinhTamDien from './components/TinhTamDien';
// import TangKinhCac from './components/TangKinhCac'; 

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('auth'); // 'auth', 'tamquan', 'chanhdien'
  
  // Dữ liệu realtime từ Firebase
  const [activeUsers, setActiveUsers] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [logs, setLogs] = useState([]);
  const [totalDangHuongGlobal, setTotalDangHuongGlobal] = useState(0);

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

  // Lắng nghe nhật ký chánh điện và tổng dâng hương
  useEffect(() => {
    const logsRef = ref(db, 'logs');
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const logList = Object.values(data).slice(-30); // Lấy 30 log gần nhất
      setLogs(logList);
    });

    const globalDangHuongRef = ref(db, 'global_stats/totalDangHuongToanCty');
    const unsubscribeDangHuong = onValue(globalDangHuongRef, (snapshot) => {
      setTotalDangHuongGlobal(snapshot.val() || 0);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeDangHuong();
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

  if (currentScreen === 'chanhdien') {
    // Tính tổng công đức toàn hệ thống
    const totalCongDucToanCty = Object.values(allUsers).reduce(
      (sum, user) => sum + (user.totalCongDuc || 0),
      0
    );

    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh', boxSizing: 'border-box' }}>
        {/* THANH ĐIỀU HƯỚNG & THỐNG KÊ NGANG HÀNG */}
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
          {/* Nút quay lại */}
          <button 
            onClick={() => setCurrentScreen('tamquan')} 
            style={{ padding: '6px 14px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            ← Cổng Tam Quan
          </button>

          {/* Các thông số thống kê */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#f7dfad', background: '#0f172a', padding: '5px 10px', borderRadius: '20px', border: '1px solid #384255' }}>
              🕯️ Tổng dâng hương: <b style={{ color: '#fff' }}>{totalDangHuongGlobal}</b>
            </span>
            <span style={{ fontSize: '12px', color: '#f7dfad', background: '#0f172a', padding: '5px 10px', borderRadius: '20px', border: '1px solid #384255' }}>
              🪵 Tổng công đức: <b style={{ color: '#fff' }}>{totalCongDucToanCty}</b>
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

        <ChanhDien 
          currentUser={currentUser} 
          activeUsers={activeUsers} 
          allUsers={allUsers} 
          logs={logs} 
        />
      </div>
    );
  }

  return null;
}