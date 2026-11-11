import React from 'react';

export default function CaroChat({ chatMessages, chatInput, setChatInput, handleSendChat, chatScrollRef, username }) {
  return (
    <div className="caro-chat-box">
      <div className="caro-chat-title">💬 Trò chuyện phòng cờ</div>
      <div className="caro-chat-messages" ref={chatScrollRef}>
        {chatMessages.length === 0 ? (
          <div className="chat-empty">Chưa có tin nhắn trong phòng.</div>
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
          placeholder="Nhập tin nhắn..." 
          maxLength={300}
        />
        <button type="submit">Gửi</button>
      </form>
    </div>
  );
}