import React, { useState } from 'react';
import Auth from './components/Auth';
import TamQuan from './components/TamQuan';
import ChanhDien from './components/ChanhDien';
// import TinhTam from './components/TinhTam'; // nếu có
// import TangKinhCac from './components/TangKinhCac'; // nếu có

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('auth'); // 'auth', 'tamquan', 'chanhdien', 'tinhtam', 'tangkinhcac'
  const [activeUsers, setActiveUsers] = useState({});

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
      <div>
        <button 
          onClick={() => setCurrentScreen('tamquan')} 
          style={{ margin: '10px', padding: '6px 12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          ← Quay lại Cổng Tam Quan
        </button>
        <ChanhDien currentUser={currentUser} activeUsers={activeUsers} />
      </div>
    );
  }

  // Thêm các màn hình khác tại đây nếu muốn
  return (
    <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>
      <h2>Khu vực đang được xây dựng...</h2>
      <button onClick={() => setCurrentScreen('tamquan')}>Quay lại Cổng Tam Quan</button>
    </div>
  );
}