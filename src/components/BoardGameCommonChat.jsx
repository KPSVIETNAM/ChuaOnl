import React, { useEffect, useRef, useState } from 'react';
import { onValue, push, ref } from 'firebase/database';
import { db } from '../firebase';

export default function BoardGameCommonChat({ currentUser }) {
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => onValue(ref(db, 'board_games/common_chat'), (snapshot) => {
    const data = snapshot.val() || {};
    setMessages(Object.entries(data).map(([id, message]) => ({ id, ...message })).slice(-40));
  }, (error) => console.error('Lỗi đọc chat chung Kỳ Viện:', error)), []);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = messageText.trim();
    if (!text || !username) return;

    try {
      await push(ref(db, 'board_games/common_chat'), {
        username,
        sender: fullName,
        text: text.slice(0, 300),
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setMessageText('');
    } catch (error) {
      console.error('Lỗi gửi chat chung Kỳ Viện:', error);
    }
  };

  return (
    <aside className="board-game-chat board-game-common-chat">
      <h3>💬 Chat chung Kỳ Viện</h3>
      <div className="board-game-messages" ref={messagesRef}>
        {messages.length === 0 ? (
          <p className="empty-chat">Chưa có tin nhắn.</p>
        ) : messages.map((message) => (
          <div key={message.id} className={`board-game-message ${message.username === username ? 'mine' : ''}`}>
            <b>{message.sender}</b><small>{message.time}</small><p>{message.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          maxLength={300}
          placeholder="Nhập tin nhắn..."
          aria-label="Tin nhắn chat chung Kỳ Viện"
        />
        <button type="submit" disabled={!username}>Gửi</button>
      </form>
    </aside>
  );
}
