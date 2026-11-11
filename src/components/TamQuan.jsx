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
      {/* Nút thoát tài khoản */}
      <button 
        onClick={handleLogout} 
        style={{ padding: '6px 12px', background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
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
    {/* 4. Nút Kỳ Viện Caro (Đặt riêng dạng Badge/Đao đài nhỏ ở góc phải màn hình) */}
      <div 
        style={{
          ...styles.caroWidget,
          transform: hoveredGate === 'CoCaro' ? 'scale(1.05)' : 'scale(1)',
          borderColor: hoveredGate === 'CoCaro' ? '#ffb703' : 'rgba(255, 183, 3, 0.4)',
          backgroundColor: hoveredGate === 'CoCaro' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.75)',
        }}
        onMouseEnter={() => setHoveredGate('CoCaro')}
        onMouseLeave={() => setHoveredGate(null)}
        onClick={() => onNavigate('CoCaro')}
      >
        <span style={{ fontSize: '24px' }}>⚔️</span>
        <div style={{ textAlign: 'left' }}>
          <div style={styles.caroTitle}>Kỳ Viện Caro</div>
          <div style={styles.caroSubText}>Đọ sức trí tuệ</div>
        </div>
      </div>
    </div>
  );
}
{/* Thêm ô Lối vào Caro trong gatesContainer của TamQuan.jsx */}
 

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
  }
  // Style riêng cho ô Caro nhỏ gọn ở góc dưới/giữa phía bên phải
  ,caroWidget: {
    position: 'absolute',
    bottom: '40px',
    right: '40px',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 183, 3, 0.4)',
    backdropFilter: 'blur(8px)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
  },
  caroTitle: {
    color: '#ffb703',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: 0
  },
  caroSubText: {
    color: '#cbd5e1',
    fontSize: '11px',
    margin: 0
  }
};