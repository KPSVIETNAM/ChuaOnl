import React, { useState } from 'react';

export default function TamQuan({ currentUser, onNavigate }) {
  const [hoveredGate, setHoveredGate] = useState(null);

  return (
    <div style={styles.container}>
      {/* Lời chào ở vị trí phía trên */}
      <div style={styles.headerBox}>
        <div style={styles.welcomeText}>
          A di đà Phật, chào mừng đạo hữu <span style={{ color: '#ffb703' }}>{currentUser?.fullName || currentUser?.username}</span> đến với cửa thiền.
        </div>
        <div style={styles.subText}>Rà chuột và chọn lối đi để tiếp tục hành trình:</div>
      </div>

      {/* Khung chứa 3 lối đi - Chỉ chiếm khoảng 35% chiều cao ở giữa màn hình */}
      <div style={styles.centerWrapper}>
        <div style={styles.gatesContainer}>
          
          {/* 1. Bên trái: Tịnh Tâm Điện */}
          <div 
            style={{
              ...styles.gateCard,
              backgroundColor: hoveredGate === 'tinhtam' ? 'rgba(30, 41, 59, 0.65)' : 'rgba(15, 23, 42, 0.25)',
              borderColor: hoveredGate === 'tinhtam' ? '#3b82f6' : 'rgba(255, 255, 255, 0.15)',
              boxShadow: hoveredGate === 'tinhtam' ? '0 12px 32px rgba(59, 130, 246, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.3)',
              transform: hoveredGate === 'tinhtam' ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
            }}
            onMouseEnter={() => setHoveredGate('tinhtam')}
            onMouseLeave={() => setHoveredGate(null)}
            onClick={() => onNavigate('tinhtam')}
          >
            <span style={styles.gateIcon}>🧘</span>
            <h3 style={{
              ...styles.gateTitle,
              opacity: hoveredGate === 'tinhtam' ? 1 : 0.6
            }}>Tịnh Tâm Điện</h3>
            <p style={{
              ...styles.gateDesc,
              opacity: hoveredGate === 'tinhtam' ? 1 : 0.4
            }}>Nơi tịnh dưỡng, tĩnh tâm, buông bỏ muộn phiền.</p>
          </div>

          {/* 2. Chính giữa: Chánh Điện */}
          <div 
            style={{
              ...styles.gateCard,
              backgroundColor: hoveredGate === 'chanhdien' ? 'rgba(30, 41, 59, 0.65)' : 'rgba(15, 23, 42, 0.25)',
              borderColor: hoveredGate === 'chanhdien' ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
              boxShadow: hoveredGate === 'chanhdien' ? '0 12px 32px rgba(245, 158, 11, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.3)',
              transform: hoveredGate === 'chanhdien' ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
            }}
            onMouseEnter={() => setHoveredGate('chanhdien')}
            onMouseLeave={() => setHoveredGate(null)}
            onClick={() => onNavigate('chanhdien')}
          >
            <span style={styles.gateIcon}>🪷</span>
            <h3 style={{
              ...styles.gateTitle,
              opacity: hoveredGate === 'chanhdien' ? 1 : 0.6
            }}>Chánh Điện</h3>
            <p style={{
              ...styles.gateDesc,
              opacity: hoveredGate === 'chanhdien' ? 1 : 0.4
            }}>Dâng hương cầu an, gõ mõ tích công đức và giao lưu.</p>
          </div>

          {/* 3. Bên phải: Tàng Kinh Các */}
          <div 
            style={{
              ...styles.gateCard,
              backgroundColor: hoveredGate === 'tangkinhcac' ? 'rgba(30, 41, 59, 0.65)' : 'rgba(15, 23, 42, 0.25)',
              borderColor: hoveredGate === 'tangkinhcac' ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
              boxShadow: hoveredGate === 'tangkinhcac' ? '0 12px 32px rgba(16, 185, 129, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.3)',
              transform: hoveredGate === 'tangkinhcac' ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
            }}
            onMouseEnter={() => setHoveredGate('tangkinhcac')}
            onMouseLeave={() => setHoveredGate(null)}
            onClick={() => onNavigate('tangkinhcac')}
          >
            <span style={styles.gateIcon}>📖</span>
            <h3 style={{
              ...styles.gateTitle,
              opacity: hoveredGate === 'tangkinhcac' ? 1 : 0.6
            }}>Tàng Kinh Các</h3>
            <p style={{
              ...styles.gateDesc,
              opacity: hoveredGate === 'tangkinhcac' ? 1 : 0.4
            }}>Kho tàng kinh điển, tài liệu và tri thức Phật pháp.</p>
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
    backgroundPosition: 'center center', // Giữ ảnh luôn chuẩn trung tâm
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
  // Vùng bao phủ khoảng 30-35% ở giữa màn hình
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
    alignItems: 'stretch',
    gap: '24px',
    width: '100%',
    maxWidth: '1000px',
  },
  gateCard: {
    flex: 1,
    padding: '30px 20px',
    borderRadius: '16px',
    border: '2px solid',
    backdropFilter: 'blur(8px)', // Hiệu ứng kính mờ mặt nước
    WebkitBackdropFilter: 'blur(8px)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  gateIcon: {
    fontSize: '42px',
    display: 'block',
    marginBottom: '12px',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
  },
  gateTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    color: '#ffb703',
    letterSpacing: '1px',
    transition: 'opacity 0.3s ease',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
  },
  gateDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#e2e8f0',
    lineHeight: '1.4',
    transition: 'opacity 0.3s ease',
    textShadow: '0 1px 3px rgba(0,0,0,0.8)'
  }
};