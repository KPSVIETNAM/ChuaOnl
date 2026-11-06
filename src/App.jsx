import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, set } from 'firebase/database';
import Auth from './components/Auth';
import ChanhDien from './components/ChanhDien';
import Leaderboard from './components/Leaderboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeUsers, setActiveUsers] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    onValue(ref(db, 'global_stats/totalCongDucToanCty'), s => setTotalGlobal(s.val() || 0));
    onValue(ref(db, 'online_users'), s => setActiveUsers(s.val() || {}));
    onValue(ref(db, 'users'), s => setAllUsers(s.val() || {}));
    onValue(ref(db, 'logs'), s => {
      const data = s.val() || {};
      setLogs(Object.values(data).slice(-6).reverse());
    });
  }, []);

  // Lắng nghe điểm công đức riêng
  useEffect(() => {
    if (!currentUser) return;
    return onValue(ref(db, `users/${currentUser.username}`), s => {
      if (s.val()) setCurrentUser(prev => ({ ...prev, totalCongDuc: s.val().totalCongDuc || 0 }));
    });
  }, [currentUser?.username]);

  const handleLogout = () => {
    if (currentUser) set(ref(db, `online_users/${currentUser.username}`), null);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '15px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
        <h2>🏮 CHÁNH ĐIỆN TỊNH TÂM 🏮</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Xin chào: <b style={{ color: '#fbbf24' }}>{currentUser.fullName}</b></span>
          <span style={{ backgroundColor: '#1e293b', padding: '4px 10px', borderRadius: '15px', fontSize: '12px' }}>
            Công đức: <b style={{ color: '#4ade80' }}>{currentUser.totalCongDuc || 0}</b> | Cty: <b style={{ color: '#fb8500' }}>{totalGlobal}</b>
          </span>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Thoát</button>
        </div>
      </div>

      {/* GRID 2 CỘT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
        <ChanhDien currentUser={currentUser} activeUsers={activeUsers} />
        <Leaderboard allUsers={allUsers} logs={logs} />
      </div>
    </div>
  );
}