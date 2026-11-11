import React from 'react';

export default function CaroInviteModal({ activeUsers, username, onInviteUser, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>✉️ Danh sách Đạo Hữu Online</h3>
        <div className="online-list">
          {activeUsers && Object.keys(activeUsers).filter(u => u !== username).length > 0 ? (
            Object.entries(activeUsers)
              .filter(([u]) => u !== username)
              .map(([u, userObj]) => {
                const isMeditating = userObj?.currentScreen === 'TinhTamDien';
                const displayName = userObj?.fullName || u;
                const currentLoc = userObj?.currentScreen ? `(Đang ở: ${userObj.currentScreen})` : '(Online)';
                return (
                  <div key={u} className="online-item">
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold', color: '#fff' }}>{displayName}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {currentLoc}
                      </div>
                    </div>
                    <button 
                      disabled={isMeditating}
                      onClick={() => onInviteUser(u, userObj)}
                      className={`send-invite-btn ${isMeditating ? 'disabled' : ''}`}
                    >
                      {isMeditating ? 'Bận' : 'Thách đấu'}
                    </button>
                  </div>
                );
              })
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
              Không có đạo hữu nào khác đang online.
            </div>
          )}
        </div>
        <button onClick={onClose} className="close-btn">Đóng</button>
      </div>
    </div>
  );
}