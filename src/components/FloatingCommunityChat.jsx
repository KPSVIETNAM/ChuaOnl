import React, { useEffect, useRef, useState } from 'react';
import { onValue, push, ref } from 'firebase/database';
import { db } from '../firebase';

export default function FloatingCommunityChat({ currentUser }) {
  const username = currentUser?.username;
  const sender = currentUser?.fullName || username || 'Đạo hữu';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    const chatRef = ref(db, 'room_chats');
    return onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      setMessages(Object.entries(data).map(([id, message]) => ({ id, ...message })).slice(-40));
    }, (error) => console.error('Lỗi đọc chat cộng đồng:', error));
  }, []);

  useEffect(() => {
    if (isOpen && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = messageText.trim();
    if (!text || !username) return;

    try {
      await push(ref(db, 'room_chats'), {
        sender,
        username,
        text: text.slice(0, 300),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      });
      setMessageText('');
    } catch (error) {
      console.error('Lỗi gửi chat cộng đồng:', error);
    }
  };

  return (
    <div className={`board-community-chat ${isOpen ? 'open' : ''}`}>
      {!isOpen ? (
        <button type="button" className="board-community-chat-toggle" onClick={() => setIsOpen(true)}>
          💬 Trò chuyện cộng đồng
        </button>
      ) : (
        <section className="board-community-chat-panel" aria-label="Trò chuyện cộng đồng">
          <header>
            <strong>💬 Trò chuyện cộng đồng</strong>
            <button type="button" aria-label="Thu gọn chat cộng đồng" onClick={() => setIsOpen(false)}>×</button>
          </header>
          <div className="board-community-chat-messages" ref={messagesRef}>
            {messages.length === 0 ? (
              <div className="board-community-chat-empty">Chưa có lời nhắn nào.</div>
            ) : messages.map((message) => (
              <div key={message.id} className={`board-community-message ${message.username === username ? 'mine' : ''}`}>
                <div><b>{message.sender}</b><time>{message.time}</time></div>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Viết lời nhắn..."
              maxLength={300}
              aria-label="Tin nhắn cộng đồng"
            />
            <button type="submit" disabled={!username}>Gửi</button>
          </form>
        </section>
      )}
      <style>{`
        .board-community-chat { position: fixed; right: 20px; bottom: 20px; z-index: 1200; color: #f4ead8; font-family: inherit; }
        .board-community-chat button { cursor: pointer; }
        .board-community-chat-toggle { padding: 10px 14px; border: 1px solid #92400e; border-radius: 22px; background: #b45309; color: #fff; font-weight: 700; box-shadow: 0 4px 14px #0008; }
        .board-community-chat-panel { width: min(320px, calc(100vw - 32px)); height: min(420px, calc(100vh - 100px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #475569; border-radius: 12px; background: #202737; box-shadow: 0 8px 24px #0009; }
        .board-community-chat-panel header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #171f2d; border-bottom: 1px solid #334155; color: #ffb703; font-size: 13px; }
        .board-community-chat-panel header button { border: 0; background: transparent; color: #cbd5e1; font-size: 22px; line-height: 1; }
        .board-community-chat-messages { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding: 10px; font-size: 12px; }
        .board-community-message { max-width: 88%; align-self: flex-start; }
        .board-community-message.mine { align-self: flex-end; }
        .board-community-message > div { display: flex; gap: 8px; margin: 0 3px 3px; color: #94a3b8; font-size: 10px; }
        .board-community-message b { color: #f7dfad; }
        .board-community-message p { margin: 0; padding: 7px 9px; border-radius: 8px; background: #334155; overflow-wrap: anywhere; }
        .board-community-message.mine p { background: #92400e; color: #fff; }
        .board-community-chat-empty { margin: auto; color: #94a3b8; }
        .board-community-chat-panel form { display: flex; gap: 6px; padding: 8px; border-top: 1px solid #334155; background: #171f2d; }
        .board-community-chat-panel input { flex: 1; min-width: 0; padding: 7px 9px; border: 1px solid #475569; border-radius: 6px; background: #1e293b; color: #fff; }
        .board-community-chat-panel form button { padding: 6px 11px; border: 0; border-radius: 6px; background: #b45309; color: #fff; font-weight: 700; }
        .board-community-chat-panel form button:disabled { opacity: .5; cursor: not-allowed; }
        @media (max-width: 520px) { .board-community-chat { right: 12px; bottom: 12px; } }
      `}</style>
    </div>
  );
}
