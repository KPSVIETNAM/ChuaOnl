import React, { useState } from 'react';

export default function TamQuan({ currentUser, onNavigate, handleLogout }) {
  const [hoveredGate, setHoveredGate] = useState(null);

  return (
    <div style={styles.container}>
      {/* Lời chào ở phía trên */}
      <div style={styles.headerBox}>
        <div style={styles.welcomeText}>
          A di đà Phật, chào mừng <span style={{ color: '#ffb703' }}>{currentUser?.fullName || currentUser?.username}</span> đến với KPS Việt Nam.
        </div>
      </div>

      {/* Nút thoát tài khoản */}
      <button 
        onClick={handleLogout} 
        style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          zIndex: 10,
          padding: '6px 12px', 
          background: '#7f1d1d', 
          color: '#fca5a5', 
          border: '1px solid #991b1b', 
          borderRadius: '6px', 
          cursor: 'pointer', 
          fontWeight: 'bold', 
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
        }}
      >
        🚪 Thoát TK <b>{currentUser?.fullName}</b> 
      </button>

      {/* Vùng chứa 3 lối đi căn chỉnh đúng vị trí các cổng trên ảnh */}
      <div style={styles.gatesContainer}>
        
        {/* 1. Bên trái: Tịnh Tâm Điện */}
        <div 
          style={{
            ...styles.gateItem,
            transform: hoveredGate === 'TinhTamDien' ? 'translateY(-6px) scale(1.05)' : 'translateY(0) scale(1)',
            opacity: hoveredGate === 'TinhTamDien' ? 1 : 0.35,
          }}
          onMouseEnter={() => setHoveredGate('TinhTamDien')}
          onMouseLeave={() => setHoveredGate(null)}
          onClick={() => onNavigate('TinhTamDien')}
        >
          <span style={styles.gateIcon}>🧘</span>
          <h3 style={styles.gateTitle}>Tịnh Tâm Điện</h3>
          <p style={styles.gateDesc}>Nơi tịnh dưỡng, tĩnh tâm, buông bỏ muộn phiền.</p>
        </div>

        {/* 2. Chính giữa: Chánh Điện */}
        <div 
          style={{
            ...styles.gateItem,
            transform: hoveredGate === 'chanhdien' ? 'translateY(-6px) scale(1.05)' : 'translateY(0) scale(1)',
            opacity: hoveredGate === 'chanhdien' ? 1 : 0.35,
          }}
          onMouseEnter={() => setHoveredGate('chanhdien')}
          onMouseLeave={() => setHoveredGate(null)}
          onClick={() => onNavigate('chanhdien')}
        >
          <span style={styles.gateIcon}>🪷</span>
          <h3 style={styles.gateTitle}>Chánh Điện</h3>
          <p style={styles.gateDesc}>Dâng hương cầu an, gõ mõ tích công đức và giao lưu.</p>
        </div>

        {/* 3. Bên phải: Tàng Kinh Các */}
        <div 
          style={{
            ...styles.gateItem,
            transform: hoveredGate === 'TangKinhCac' ? 'translateY(-6px) scale(1.05)' : 'translateY(0) scale(1)',
            opacity: hoveredGate === 'TangKinhCac' ? 1 : 0.35,
          }}
          onMouseEnter={() => setHoveredGate('TangKinhCac')}
          onMouseLeave={() => setHoveredGate(null)}
          onClick={() => onNavigate('TangKinhCac')}
        >
          <span style={styles.gateIcon}>📖</span>
          <h3 style={styles.gateTitle}>Tàng Kinh Các</h3>
          <p style={styles.gateDesc}>Kho tàng kinh điển, tài liệu và tri thức Phật pháp.</p>
        </div> 

      </div>

      <div style={styles.gameSelector} aria-label="Chọn trò chơi cờ">
        {[
          { screen: 'CoCaro', icon: '❌', title: 'Cờ Caro' },
          { screen: 'CoVua', icon: '♟️', title: 'Cờ vua' },
          { screen: 'CoTuong', icon: '🀄', title: 'Cờ tướng' },
          { screen: 'covay', icon: '⚫', title: 'Cờ vây' }
        ].map((game) => (
          <button
            type="button"
            key={game.screen}
            style={{
              ...styles.gameWidget,
              backgroundColor: hoveredGate === game.screen ? 'rgba(120, 83, 35, 0.9)' : 'rgba(15, 23, 42, 0.72)',
              color: hoveredGate === game.screen ? '#fff1c2' : '#e5d7b8'
            }}
            onMouseEnter={() => setHoveredGate(game.screen)}
            onMouseLeave={() => setHoveredGate(null)}
            onClick={() => onNavigate(game.screen)}
          >
            <span style={{ ...styles.gameIcon, opacity: hoveredGate === game.screen ? 0.88 : 0.68 }}>{game.icon}</span>
            <span style={styles.gameTitle}>{game.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed', // Cố định tuyệt đối màn hình, loại bỏ lệch do thanh cuộn
    inset: 0,
    width: '100%',
    height: '100vh',
    backgroundImage: "url('/images/Congtamquan.jpg')",
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    fontFamily: 'sans-serif',
    color: '#f4ead8',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  headerBox: {
    position: 'absolute',
    top: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    textAlign: 'center',
    width: '90%',
    maxWidth: '800px',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)'
  },
  welcomeText: {
    fontSize: '20px',
    marginBottom: '8px',
    fontWeight: 'bold'
  },
  // Đặt container đúng tầm khoảng giữa màn hình nơi có 3 cổng chùa
  gatesContainer: {
    position: 'absolute',
    top: '42%',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '30px',
    width: '85%',
    maxWidth: '1100px',
    zIndex: 5
  },
  gateItem: {
    flex: 1,
    padding: '20px 10px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  gateIcon: {
    fontSize: '40px',
    display: 'block',
    marginBottom: '8px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))'
  },
  gateTitle: {
    margin: '0 0 6px 0',
    fontSize: '20px',
    color: '#ffb703',
    letterSpacing: '1px',
    textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)'
  },
  gateDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#f8fafc',
    lineHeight: '1.4',
    textShadow: '0 2px 4px rgba(0,0,0,0.9)'
  },
  gameSelector: {
    position: 'absolute',
    bottom: '22px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
    width: 'min(76vw, 270px)',
    aspectRatio: '1',
    overflow: 'hidden',
    borderRadius: '50%',
    border: '2px solid rgba(255, 183, 3, 0.58)',
    boxShadow: '0 5px 22px rgba(0,0,0,0.68), inset 0 0 18px rgba(255,183,3,0.12)',
    background: 'rgba(15, 23, 42, 0.78)',
    backdropFilter: 'blur(8px)'
  },
  gameWidget: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    minWidth: 0,
    minHeight: 0,
    padding: '8px',
    borderRadius: 0,
    border: '1px solid rgba(255, 183, 3, 0.34)',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, color 0.2s ease'
  },
  gameIcon: {
    fontSize: '32px',
    lineHeight: 1,
    filter: 'saturate(0.78) drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
    transition: 'opacity 0.2s ease'
  },
  gameTitle: {
    color: 'inherit',
    fontSize: 'clamp(11px, 2.8vw, 14px)',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    textShadow: '0 1px 4px rgba(0,0,0,0.9)'
  }
};