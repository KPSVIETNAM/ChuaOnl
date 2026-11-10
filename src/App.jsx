import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';
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
    return onValue(logsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const logList = Object.values(data).slice(-30); // Lấy 30 log gần nhất
      setLogs(logList);
    });
  }, []);

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
    return (
      <div style={{ padding: '10px', backgroundColor: '#0f172a', minHeight: '100vh' }}>
        <button 
          onClick={() => setCurrentScreen('tamquan')} 
          style={{ marginBottom: '10px', padding: '6px 14px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Quay lại Cổng Tam Quan
        </button>
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