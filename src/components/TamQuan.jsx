import React, { useState } from 'react';

export default function TamQuan({ currentUser, onNavigate }) {
  const [hoveredGate, setHoveredGate] = useState(null);

  return (
    <div style={styles.container}>
      {/* Lời chào ở phía trên */}
      <div style={styles.headerBox}>
        <div style={styles.welcomeText}>
          A di đà Phật, chào mừng <span style={{ color: '#ffb703' }}>{currentUser?.fullName || currentUser?.username}</span> đến với KPS Việt Nam.
        </div>
      </div>

      {/* Khung chứa 3 lối đi ở giữa màn hình (Không có khung tối bao quanh) */}
      <div style={styles.centerWrapper}>
        <div style={styles.gatesContainer}>
          
          {/* 1. Bên trái: Tịnh Tâm Điện */}
          <div 
            style={{
              ...styles.gateItem,
              transform: hoveredGate === 'tinhtam' ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
              opacity: hoveredGate === 'tinhtam' ? 1 : 0.35, // Rê chuột vào mới sáng rõ
            }}
            onMouseEnter={() => setHoveredGate('tinhtam')}
            onMouseLeave={() => setHoveredGate(null)}
            onClick={() => onNavigate('tinhtam')}
          >
            <span style={styles.gateIcon}>🧘</span>
            <h3 style={styles.gateTitle}>Tịnh Tâm Điện</h3>
            <p style={styles.gateDesc}>Nơi tịnh dưỡng, tĩnh tâm, buông bỏ muộn phiền.</p>
          </div>

          {/* 2. Chính giữa: Chánh Điện */}
          <div 
            style={{
              ...styles.gateItem,
              transform: hoveredGate === 'chanhdien' ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
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
              transform: hoveredGate === 'tangkinhcac' ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
              opacity: hoveredGate === 'tangkinhcac' ? 1 : 0.35,
            }}
            onMouseEnter={() => setHoveredGate('tangkinhcac')}
            onMouseLeave={() => setHoveredGate(null)}
            onClick={() => onNavigate('tangkinhcac')}
          >
            <span style={styles.gateIcon}>📖</span>
            <h3 style={styles.gateTitle}>Tàng Kinh Các</h3>
            <p style={styles.gateDesc}>Kho tàng kinh điển, tài liệu và tri thức Phật pháp.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    backgroundImage: "url('/images/Congtamquan.jpg')",
    backgroundPosition: 'center center', // Giữ ảnh luôn cố định đúng trung tâm
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    fontFamily: 'sans-serif',
    color: '#f4ead8',
    overflow: 'hidden',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerBox: {
    position: 'absolute',
    top: '40px',
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
  subText: {
    fontSize: '14px',
    color: '#cbd5e1'
  },
  // Giới hạn 3 vùng trong khoảng 35% chiều cao ở giữa
  centerWrapper: {
    width: '100%',
    maxHeight: '35vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 20px',
    boxSizing: 'border-box'
  },
  gatesContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    width: '100%',
    maxWidth: '1000px',
  },
  // Mỗi vùng lối đi hoàn toàn trong suốt, không có khung tối hay viền
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
    fontSize: '48px',
    display: 'block',
    marginBottom: '12px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))'
  },
  gateTitle: {
    margin: '0 0 8px 0',
    fontSize: '22px',
    color: '#ffb703',
    letterSpacing: '1px',
    textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)'
  },
  gateDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#f8fafc',
    lineHeight: '1.4',
    textShadow: '0 2px 4px rgba(0,0,0,0.9)'
  }
};