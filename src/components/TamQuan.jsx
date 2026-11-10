import React from 'react';

export default function TamQuan({ currentUser, onNavigate }) {
  return (
    <div style={styles.container}>
      <div style={styles.bgOverlay} />
      
      <div style={styles.contentBox}>
        <div style={styles.welcomeText}>
          A di đà Phật, chào mừng đạo hữu <span style={{ color: '#ffb703' }}>{currentUser?.fullName || currentUser?.username}</span> đến với cửa thiền.
        </div>
        <div style={styles.subText}>Xin chọn lối đi để tiếp tục hành trình:</div>

        <div style={styles.gateGrid}>
          {/* Lối đi bên trái: Tịnh tâm điện */}
          <button 
            style={{ ...styles.gateCard, borderColor: '#3b82f6' }}
            onClick={() => onNavigate('tinhtam')}
          >
            <span style={styles.gateIcon}>🧘</span>
            <h3 style={styles.gateTitle}>Tịnh Tâm Điện</h3>
            <p style={styles.gateDesc}>Nơi tịnh dưỡng, tĩnh tâm, buông bỏ muộn phiền.</p>
          </button>

          {/* Lối đi chính giữa: Chánh điện */}
          <button 
            style={{ ...styles.gateCard, borderColor: '#f59e0b', transform: 'scale(1.05)' }}
            onClick={() => onNavigate('chanhdien')}
          >
            <span style={styles.gateIcon}>🪷</span>
            <h3 style={styles.gateTitle}>Chánh Điện</h3>
            <p style={styles.gateDesc}>Dâng hương cầu an, gõ mõ tích công đức và giao lưu.</p>
          </button>

          {/* Lối đi bên phải: Tàng kinh các */}
          <button 
            style={{ ...styles.gateCard, borderColor: '#10b981' }}
            onClick={() => onNavigate('tangkinhcac')}
          >
            <span style={styles.gateIcon}>📖</span>
            <h3 style={styles.gateTitle}>Tàng Kinh Các</h3>
            <p style={styles.gateDesc}>Kho tàng kinh điển, tài liệu và tri thức Phật pháp.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundImage: "url('/images/Congtamquan.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: 'sans-serif',
    color: '#f4ead8',
    padding: '20px',
    boxSizing: 'border-box'
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    zIndex: 1
  },
  contentBox: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    maxWidth: '900px',
    width: '100%'
  },
  welcomeText: {
    fontSize: '20px',
    marginBottom: '8px',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  subText: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '35px'
  },
  gateGrid: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '25px',
    flexWrap: 'wrap'
  },
  gateCard: {
    backgroundColor: '#1e293b',
    border: '2px solid',
    borderRadius: '16px',
    padding: '25px 20px',
    width: '240px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    textAlign: 'center',
    color: '#f4ead8',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
  },
  gateIcon: {
    fontSize: '40px',
    display: 'block',
    marginBottom: '15px'
  },
  gateTitle: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    color: '#ffb703',
    letterSpacing: '1px'
  },
  gateDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.4'
  }
};