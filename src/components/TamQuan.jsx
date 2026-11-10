import React, { useState } from 'react';

export default function TamQuan({ currentUser, onNavigate }) {
  const [hoveredGate, setHoveredGate] = useState(null);

  return (
    <div style={styles.container}>
      {/* Lời chào trang trọng ở phía trên */}
      <div style={styles.headerBox}>
        <div style={styles.welcomeText}>
          A di đà Phật, chào mừng <span style={{ color: '#ffb703' }}>{currentUser?.fullName || currentUser?.username}</span> đến với KPS Viet Nam.
        </div> 
      </div>

      {/* Chia màn hình thành 3 cột bấm chọn phủ kín */}
      <div style={styles.gatesContainer}>
        
        {/* 1. Lối đi bên trái: Tịnh Tâm Điện */}
        <div 
          style={{
            ...styles.gateColumn,
            backgroundColor: hoveredGate === 'tinhtam' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
            backdropFilter: hoveredGate === 'tinhtam' ? 'blur(4px)' : 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)'
          }}
          onMouseEnter={() => setHoveredGate('tinhtam')}
          onMouseLeave={() => setHoveredGate(null)}
          onClick={() => onNavigate('tinhtam')}
        >
          <div style={{
            ...styles.gateContent,
            opacity: hoveredGate === 'tinhtam' ? 1 : 0.2, // Mặc định ẩn mờ, hover mới hiện rõ
            transform: hoveredGate === 'tinhtam' ? 'translateY(0) scale(1.03)' : 'translateY(15px) scale(0.98)'
          }}>
            <span style={styles.gateIcon}>🧘</span>
            <h3 style={styles.gateTitle}>Tịnh Tâm Điện</h3>
            <p style={styles.gateDesc}>Nơi tịnh dưỡng, tĩnh tâm, buông bỏ muộn phiền.</p>
          </div>
        </div>

        {/* 2. Lối đi chính giữa: Chánh Điện */}
        <div 
          style={{
            ...styles.gateColumn,
            backgroundColor: hoveredGate === 'chanhdien' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
            backdropFilter: hoveredGate === 'chanhdien' ? 'blur(4px)' : 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)'
          }}
          onMouseEnter={() => setHoveredGate('chanhdien')}
          onMouseLeave={() => setHoveredGate(null)}
          onClick={() => onNavigate('chanhdien')}
        >
          <div style={{
            ...styles.gateContent,
            opacity: hoveredGate === 'chanhdien' ? 1 : 0.2,
            transform: hoveredGate === 'chanhdien' ? 'translateY(0) scale(1.03)' : 'translateY(15px) scale(0.98)'
          }}>
            <span style={styles.gateIcon}>🪷</span>
            <h3 style={styles.gateTitle}>Chánh Điện</h3>
            <p style={styles.gateDesc}>Dâng hương cầu an, gõ mõ tích công đức và giao lưu.</p>
          </div>
        </div>

        {/* 3. Lối đi bên phải: Tàng Kinh Các */}
        <div 
          style={{
            ...styles.gateColumn,
            backgroundColor: hoveredGate === 'tangkinhcac' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
            backdropFilter: hoveredGate === 'tangkinhcac' ? 'blur(4px)' : 'none',
          }}
          onMouseEnter={() => setHoveredGate('tangkinhcac')}
          onMouseLeave={() => setHoveredGate(null)}
          onClick={() => onNavigate('tangkinhcac')}
        >
          <div style={{
            ...styles.gateContent,
            opacity: hoveredGate === 'tangkinhcac' ? 1 : 0.2,
            transform: hoveredGate === 'tangkinhcac' ? 'translateY(0) scale(1.03)' : 'translateY(15px) scale(0.98)'
          }}>
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
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: 'sans-serif',
    color: '#f4ead8',
    overflow: 'hidden',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  headerBox: {
    position: 'absolute',
    top: '25px',
    left: '0',
    right: '0',
    zIndex: 10,
    textAlign: 'center',
    pointerEvents: 'none', // Để không cản trở việc click xuyên qua vùng chữ xuống các cột bên dưới
    textShadow: '0 2px 6px rgba(0,0,0,0.8)'
  },
  welcomeText: {
    fontSize: '18px',
    marginBottom: '6px',
    fontWeight: 'bold'
  },
  subText: {
    fontSize: '13px',
    color: '#cbd5e1'
  },
  gatesContainer: {
    display: 'flex',
    width: '100%',
    height: '100%'
  },
  gateColumn: {
    flex: 1,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.4s ease, backdrop-filter 0.4s ease',
    position: 'relative',
    boxSizing: 'border-box',
    padding: '20px'
  },
  gateContent: {
    textAlign: 'center',
    padding: '30px 20px',
    borderRadius: '16px',
    backgroundColor: 'rgba(15, 23, 42, 0.65)', // Hộp nhỏ chứa chữ nổi lên khi hover
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    maxWidth: '280px',
    width: '100%'
  },
  gateIcon: {
    fontSize: '45px',
    display: 'block',
    marginBottom: '15px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
  },
  gateTitle: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    color: '#ffb703',
    letterSpacing: '1px',
    textShadow: '0 2px 4px rgba(0,0,0,0.6)'
  },
  gateDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#e2e8f0',
    lineHeight: '1.5',
    textShadow: '0 1px 3px rgba(0,0,0,0.6)'
  }
};