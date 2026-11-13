import React from 'react';
import { getGamePresenceLabel } from './gamePresence';

export default function GameInviteModal({ activeUsers, username, gameName, disabledUsers = {}, onInviteUser, onClose }) {
  const users = Object.entries(activeUsers || {}).filter(([userKey]) => userKey !== username);

  return (
    <div className="game-invite-overlay" onClick={onClose}>
      <section className="game-invite-dialog" onClick={(event) => event.stopPropagation()}>
        <h3>✉️ Mời đạo hữu chơi {gameName}</h3>
        <div className="game-invite-list">
          {users.length ? users.map(([userKey, user]) => {
            const isMeditating = user?.currentScreen === 'TinhTamDien';
            const isAlreadyInvited = disabledUsers[userKey];
            return (
              <div className="game-invite-user" key={userKey}>
                <div>
                  <strong>{user?.fullName || userKey}</strong>
                  <small>{getGamePresenceLabel(user)}</small>
                </div>
                <button
                  type="button"
                  disabled={isMeditating || isAlreadyInvited}
                  onClick={() => onInviteUser(userKey, user)}
                >
                  {isMeditating ? 'Đang bận' : isAlreadyInvited ? 'Đã mời' : 'Mời chơi'}
                </button>
              </div>
            );
          }) : <p className="game-invite-empty">Không có đạo hữu nào khác đang online.</p>}
        </div>
        <button type="button" className="game-invite-close" onClick={onClose}>Đóng</button>
      </section>
      <style>{`
        .game-invite-overlay { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: center; justify-content: center; padding: 16px; background: #000b; }
        .game-invite-dialog { width: min(100%, 400px); padding: 18px; border: 1px solid #475569; border-radius: 12px; background: #1e293b; color: #fff; box-shadow: 0 12px 30px #0009; }
        .game-invite-dialog h3 { margin: 0 0 14px; color: #f7dfad; font-size: 16px; }
        .game-invite-list { display: flex; flex-direction: column; gap: 8px; max-height: 55vh; overflow-y: auto; }
        .game-invite-user { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px; border-radius: 8px; background: #0f172a; }
        .game-invite-user > div { display: flex; min-width: 0; flex-direction: column; gap: 3px; text-align: left; }
        .game-invite-user strong { overflow-wrap: anywhere; font-size: 12px; }
        .game-invite-user small { color: #94a3b8; font-size: 10px; }
        .game-invite-user button, .game-invite-close { padding: 7px 10px; border: 0; border-radius: 6px; background: #047857; color: #fff; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .game-invite-user button:disabled { background: #475569; cursor: not-allowed; }
        .game-invite-empty { margin: 12px 0; color: #94a3b8; font-size: 12px; text-align: center; }
        .game-invite-close { width: 100%; margin-top: 12px; background: #334155; }
      `}</style>
    </div>
  );
}
