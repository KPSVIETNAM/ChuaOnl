import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, set, update, push, onValue, remove } from 'firebase/database';

const BOARD_SIZE = 15;

export default function CoCaro({ currentUser, activeUsers = {}, setNotice, onBack }) {
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';

  const [roomId, setRoomId] = useState('phong_chung'); // Mặc định phòng chung
  const [roomData, setRoomData] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // State cho khung chat riêng của phòng cờ
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef(null);

  // 1. Cập nhật trạng thái user online
  useEffect(() => {
    if (!username) return;
    const userOnlineRef = ref(db, `online_users/${username}`);
    update(userOnlineRef, { currentScreen: 'caro' });

    return () => {
      update(userOnlineRef, { currentScreen: 'idle' });
    };
  }, [username]);

  // 2. Lắng nghe trạng thái phòng cờ Realtime (Bao gồm cả bàn cờ và tin nhắn chat)
  useEffect(() => {
    const roomRef = ref(db, `caro_rooms/${roomId}`);
    const unsub = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() || {};
      setRoomData(data);
      
      // Chuyển đổi object chat messages thành array
      if (data.chat) {
        const msgs = Object.entries(data.chat).map(([id, m]) => ({ id, ...m }));
        setChatMessages(msgs);
      } else {
        setChatMessages([]);
      }
    });
    return () => unsub();
  }, [roomId]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Khởi tạo phòng
  const handleJoinRoom = async (rId) => {
    setRoomId(rId);
    const roomRef = ref(db, `caro_rooms/${rId}`);
    onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        set(roomRef, {
          players: { [username]: { fullName, ready: false, symbol: 'X' } },
          board: Array(BOARD_SIZE * BOARD_SIZE).fill(''),
          turn: username,
          status: 'waiting'
        });
      }
    }, { onlyOnce: true });
  };

  // Nút Sẵn sàng
  const handleToggleReady = async () => {
    if (!roomData) return;
    const isReady = roomData.players?.[username]?.ready || false;
    const players = roomData.players || {};
    
    const updatedPlayers = {
      ...players,
      [username]: { fullName, ready: !isReady, symbol: Object.keys(players).length === 1 ? 'X' : 'O' }
    };

    const playerKeys = Object.keys(updatedPlayers);
    const allReady = playerKeys.length === 2 && playerKeys.every(k => updatedPlayers[k].ready);

    await update(ref(db, `caro_rooms/${roomId}`), {
      players: updatedPlayers,
      status: allReady ? 'playing' : 'waiting',
      turn: playerKeys[0] || username
    });
  };

  // Mời người chơi Online (Chặn nếu đang ở Tịnh Tâm Điện)
  const handleInviteUser = async (targetUsername, targetUserObj) => {
    if (targetUserObj?.currentScreen === 'TinhTamDien' || targetUserObj?.status?.includes('tịnh tâm')) {
      setNotice(`Đạo hữu ${targetUserObj.fullName || targetUsername} đang tịnh tâm, không thể quấy rầy! 🧘`);
      return;
    }

    await set(ref(db, `caro_invites/${targetUsername}`), {
      fromUsername: username,
      fromFullName: fullName,
      roomId: roomId,
      timestamp: Date.now()
    });

    setNotice(`Đã gửi lời mời thách đấu tới ${targetUserObj.fullName || targetUsername}!`);
    setShowInviteModal(false);
  };

  // Gửi tin nhắn chat riêng trong phòng cờ
  const handleSendChat = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    push(ref(db, `caro_rooms/${roomId}/chat`), {
      sender: fullName,
      username,
      text: text.slice(0, 300),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });
    setChatInput('');
  };

  // Logic Đánh cờ
  const handleCellClick = async (index) => {
    if (!roomData || roomData.status !== 'playing') return;
    if (roomData.turn !== username) return;
    if (roomData.board[index] !== '') return;

    const mySymbol = roomData.players[username]?.symbol || 'X';
    const newBoard = [...roomData.board];
    newBoard[index] = mySymbol;

    const otherPlayer = Object.keys(roomData.players).find(k => k !== username);
    const isWin = checkWin(newBoard, index, mySymbol);

    await update(ref(db, `caro_rooms/${roomId}`), {
      board: newBoard,
      turn: isWin ? '' : otherPlayer,
      status: isWin ? 'finished' : 'playing',
      winner: isWin ? fullName : null
    });
  };

  const checkWin = (board, idx, symbol) => {
    const row = Math.floor(idx / BOARD_SIZE);
    const col = idx % BOARD_SIZE;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (let [dx, dy] of directions) {
      let count = 1;
      for (let i = 1; i < 5; i++) {
        const r = row + dx * i;
        const c = col + dy * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r * BOARD_SIZE + c] === symbol) count++;
        else break;
      }
      for (let i = 1; i < 5; i++) {
        const r = row - dx * i;
        const c = col - dy * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r * BOARD_SIZE + c] === symbol) count++;
        else break;
      }
      if (count >= 5) return true;
    }
    return false;
  };

  const players = roomData?.players || {};
  const isMyReady = players[username]?.ready || false;

  return (
    <div className="caro-container">
      <div className="caro-header">
        <h2 style={{ color: '#ffb703', margin: 0 }}>⚔️ KỲ VIỆN CỜ CARO ⚔️</h2>
        <button onClick={() => setShowInviteModal(true)} className="invite-btn">
          ✉️ Mời Đạo Hữu Online
        </button>
      </div>

      {/* Trạng thái phòng & Sẵn sàng */}
      <div className="caro-status-bar">
        <div className="players-info">
          {Object.entries(players).map(([uname, p]) => (
            <span key={uname} className={`player-badge ${p.ready ? 'ready' : ''}`}>
              {p.symbol === 'X' ? '❌' : '⭕'} {p.fullName} {p.ready ? '(Đã sẵn sàng)' : '(Đang chờ)'}
            </span>
          ))}
        </div>

        {roomData?.status === 'waiting' && (
          <button onClick={handleToggleReady} className={`ready-btn ${isMyReady ? 'is-ready' : ''}`}>
            {isMyReady ? 'CANCEL SẴN SÀNG' : '⚡ SẴN SÀNG'}
          </button>
        )}

        {roomData?.status === 'playing' && (
          <div className="turn-notice">
            Lượt đi: <b>{roomData.turn === username ? 'BẠN' : roomData.players[roomData.turn]?.fullName}</b>
          </div>
        )}

        {roomData?.status === 'finished' && (
          <div className="win-notice">
            🎉 <b>{roomData.winner}</b> ĐÃ THẮNG BÀN CỜ!
          </div>
        )}
      </div>

      {/* GIAO DIỆN CHÍNH: BÀN CỜ VÀ KHUNG CHAT RIÊNG */}
      <div className="caro-main-layout">
        {/* Bàn cờ 15x15 */}
        <div className="caro-board">
          {roomData?.board?.map((cell, idx) => (
            <button 
              key={idx} 
              className={`caro-cell ${cell}`}
              onClick={() => handleCellClick(idx)}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Khung chat riêng trong phòng cờ */}
        <div className="caro-chat-box">
          <div className="caro-chat-title">💬 Trò chuyện phòng cờ</div>
          <div className="caro-chat-messages" ref={chatScrollRef}>
            {chatMessages.length === 0 ? (
              <div className="chat-empty">Chưa có tin nhắn nào trong phòng.</div>
            ) : (
              chatMessages.map((msg) => {
                const isMine = msg.username === username;
                return (
                  <div key={msg.id} className={`caro-msg ${isMine ? 'my-msg' : ''}`}>
                    <div className="caro-msg-meta">
                      <strong>{msg.sender}</strong>
                      <time>{msg.time}</time>
                    </div>
                    <div className="caro-msg-bubble">{msg.text}</div>
                  </div>
                );
              })
            )}
          </div>
          <form className="caro-chat-form" onSubmit={handleSendChat}>
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Nhập tin nhắn bàn cờ..." 
              maxLength={300}
            />
            <button type="submit">Gửi</button>
          </form>
        </div>
      </div>

      {/* MODAL MỜI NGƯỜI CHƠI */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>✉️ Danh sách Đạo Hữu Online</h3>
            <div className="online-list">
              {Object.entries(activeUsers)
                .filter(([u]) => u !== username)
                .map(([u, userObj]) => {
                  const isMeditating = userObj?.currentScreen === 'TinhTamDien' || userObj?.status?.includes('tịnh tâm');
                  return (
                    <div key={u} className="online-item">
                      <span>{userObj.fullName || u} {isMeditating ? '🧘 (Đang Tịnh Tâm)' : ''}</span>
                      <button 
                        disabled={isMeditating}
                        onClick={() => handleInviteUser(u, userObj)}
                        className={`send-invite-btn ${isMeditating ? 'disabled' : ''}`}
                      >
                        {isMeditating ? 'Không thể mời' : 'Thách đấu'}
                      </button>
                    </div>
                  );
                })}
            </div>
            <button onClick={() => setShowInviteModal(false)} className="close-btn">Đóng</button>
          </div>
        </div>
      )}

      <style>{`
        .caro-container { max-width: 1000px; margin: 0 auto; padding: 20px; background: #171d2b; border-radius: 16px; color: #fff; text-align: center; }
        .caro-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .invite-btn { padding: 8px 16px; background: #b45309; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .caro-status-bar { background: #202737; padding: 12px; border-radius: 10px; margin-bottom: 15px; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 10px; }
        .player-badge { padding: 4px 10px; background: #334155; border-radius: 20px; font-size: 12px; }
        .player-badge.ready { background: #065f46; color: #a7f3d0; }
        .ready-btn { padding: 8px 18px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .ready-btn.is-ready { background: #dc2626; }
        
        .caro-main-layout { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
        .caro-board { display: grid; grid-template-columns: repeat(15, 1fr); gap: 2px; background: #34394a; padding: 4px; border-radius: 8px; width: 100%; max-width: 520px; aspect-ratio: 1; }
        .caro-cell { background: #1e293b; border: none; font-size: 14px; font-weight: bold; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center; }
        .caro-cell:hover { background: #334155; }
        .caro-cell.X { color: #ef4444; }
        .caro-cell.O { color: #3b82f6; }

        /* Khung chat riêng phòng cờ */
        .caro-chat-box { width: 300px; height: 520px; background: #202737; border: 1px solid #34394a; border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; text-align: left; }
        .caro-chat-title { padding: 10px 14px; background: #171f2d; font-size: 13px; font-weight: bold; color: #ffb703; border-bottom: 1px solid #334155; }
        .caro-chat-messages { flex: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; font-size: 11px; }
        .caro-msg { max-width: 85%; align-self: flex-start; }
        .caro-msg.my-msg { align-self: flex-end; }
        .caro-msg-meta { display: flex; gap: 6px; margin-bottom: 2px; font-size: 9px; color: #94a3b8; }
        .caro-msg-meta strong { color: #f7dfad; }
        .caro-msg-bubble { padding: 6px 10px; background: #334155; color: #f1f5f9; border-radius: 8px; line-height: 1.4; word-break: break-word; }
        .caro-msg.my-msg .caro-msg-bubble { background: #b45309; color: #fff; }
        .chat-empty { text-align: center; color: #94a3b8; margin: auto; }
        .caro-chat-form { display: flex; padding: 8px; background: #171f2d; border-top: 1px solid #334155; gap: 6px; }
        .caro-chat-form input { flex: 1; padding: 6px 10px; background: #1e293b; border: 1px solid #475569; border-radius: 6px; color: #fff; font-size: 11px; outline: none; }
        .caro-chat-form button { padding: 6px 12px; background: #b45309; color: #fff; border: none; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #1e293b; padding: 20px; border-radius: 12px; width: 90%; max-width: 400px; text-align: left; }
        .online-list { max-height: 250px; overflow-y: auto; margin: 15px 0; display: flex; flex-direction: column; gap: 8px; }
        .online-item { display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 8px 12px; border-radius: 6px; font-size: 13px; }
        .send-invite-btn { padding: 4px 10px; background: #059669; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .send-invite-btn.disabled { background: #475569; cursor: not-allowed; }
        .close-btn { width: 100%; padding: 8px; background: #334155; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
    </div>
  );
}