import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, push, update, remove, onDisconnect, runTransaction, onValue } from 'firebase/database';
import VuLanBaohieu from '../../public/book/VuLanBaohieu'; 

export default function TangKinhCac({ currentUser, queueList = [], loiNguyetInput = '', setNotice, onBack }) {
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';

  // Khóa lưu trạng thái Bật/Tắt nhạc nền riêng cho từng tài khoản trong localStorage
  const storageKey = `tangkinhcac_audio_${username || 'guest'}`;
  const [isAudioPlaying, setIsAudioPlaying] = useState(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [totalDocKinhCount, setTotalDocKinhCount] = useState(0);
  const audioRef = useRef(null);

  // Trạng thái cho Khung chat thu gọn
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef(null);

  // State lưu quyển sách đang mở (null là hiển thị danh sách, hoặc 'vulan', 'phomon'...)
  const [selectedBookId, setSelectedBookId] = useState(null);

  // State quản lý ẩn/hiện Modal Sơ Đồ KPS
  const [showSodoModal, setShowSodoModal] = useState(false);

  // Danh sách sách trong thư viện
  const bookLinks = [
    { id: 'vulan', title: '📖 Kinh Vu Lan Báo Hiếu', type: 'component' },
    { id: 'phomon', title: '📖 Kinh Phổ Môn', type: 'component' },
    { id: 'kimcuong', title: '📖 Kinh Kim Cương', type: 'component' },
    { id: 'sotay', title: '📖 Sổ tay Tịnh tâm hành trì', type: 'component' },
    { id: 'Sodocty', title: '📖 Sơ Đồ KPS', type: 'image' }, // Đổi type thành image để phân biệt
  ];

  // Lắng nghe tổng số lượt đọc kinh toàn hệ thống
  useEffect(() => {
    const kinhRef = ref(db, 'global_stats/totalTangKinhToanCty');
    const unsubscribe = onValue(kinhRef, (snapshot) => {
      setTotalDocKinhCount(snapshot.val() || 0);
    });
    return () => unsubscribe();
  }, []);

  // Lắng nghe chat realtime cho Tàng Kinh Các
  useEffect(() => {
    const chatRef = ref(db, 'room_chats');
    return onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      const messages = Object.entries(data)
        .map(([id, message]) => ({ id, ...message }))
        .slice(-40);
      setChatMessages(messages);
    });
  }, []);

  useEffect(() => {
    if (isChatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  // Xử lý nhạc nền amnen.mp3
  useEffect(() => {
    audioRef.current = new Audio('/audio/amnen.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    if (isAudioPlaying) {
      audioRef.current.play().catch(() => {});
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      localStorage.setItem(storageKey, JSON.stringify(false));
    } else {
      audioRef.current.play().catch(() => {});
      setIsAudioPlaying(true);
      localStorage.setItem(storageKey, JSON.stringify(true));
    }
  };

  const handleGoMo = () => {
    if (!username) return;

    const moAudio = new Audio('/audio/mo.mp3');
    moAudio.currentTime = 0;
    moAudio.play().catch(() => {});

    runTransaction(ref(db, `users/${username}/totalCongDuc`), (count) => (count || 0) + 1);
    runTransaction(ref(db, 'global_stats/totalCongDucToanCty'), (count) => (count || 0) + 1);
    
    push(ref(db, 'logs'), {
      text: `${fullName} gõ mõ đọc kinh tại Tàng Kinh Các!`,
      time: new Date().toLocaleTimeString(),
    });
  };

  const handleSendChat = (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || !username) return;

    push(ref(db, 'room_chats'), {
      sender: fullName,
      username,
      text: message.slice(0, 300),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    });
    setChatInput('');
  };

  // Hàm xử lý khi click vào các mục trong Thư Viện Kinh Sách
  const handleBookClick = (bookId) => {
    if (bookId === 'Sodocty') {
      setShowSodoModal(true); // Bật modal hiển thị ảnh Sơ Đồ KPS
    } else {
      setSelectedBookId(bookId); // Mở các sách dạng component khác
    }
  };

  return (
    <div className="tang-kinh-container">
      <div className="tang-kinh-header-bar">  
        <div style={{ width: '120px' }}></div>
      
        <h2 
          className="tang-kinh-title" 
          onClick={() => { setSelectedBookId(null); setShowSodoModal(false); }}
          style={{ cursor: 'pointer', margin: 0, textAlign: 'center', flex: 1 }}
          title="Trở về trang chính Tàng Kinh Các"
        >
          📖 TÀNG KINH CÁC 📖
        </h2> 

        <button onClick={toggleAudio} className={`audio-toggle-btn ${isAudioPlaying ? 'active' : 'muted'}`} style={{ width: '120px' }}>
          {isAudioPlaying ? '🔊 Nhạc nền: Bật' : '🔇 Nhạc nền: Tắt'}
        </button> 
      </div>

      <div className="tang-kinh-content"> 

        {selectedBookId ? (
          <div className="book-reader-view" style={{ width: '100%', textAlign: 'left' }}> 
            {selectedBookId === 'vulan' && <VuLanBaohieu />}
            {selectedBookId === 'phomon' && <div style={{ padding: '20px', textAlign: 'center' }}>Đang cập nhật Kinh Phổ Môn...</div>}
            {selectedBookId === 'kimcuong' && <div style={{ padding: '20px', textAlign: 'center' }}>Đang cập nhật Kinh Kim Cương...</div>}
            {selectedBookId === 'sotay' && <div style={{ padding: '20px', textAlign: 'center' }}>Đang cập nhật Sổ tay Tịnh tâm...</div>}
          </div>
        ) : (
          <>
            <div className="tang-kinh-banner">
              <img 
                src="/images/Tangkinhcac.jpg" 
                alt="Tàng Kinh Các" 
                className="tang-kinh-img"
              />
            </div>

            {/* KHU VỰC LIÊN KẾT ĐỌC SÁCH */}
            <div className="book-links-section">
              <h3>📚 Thư Viện Kinh Sách</h3>
              <div className="book-links-grid">
                {bookLinks.map((book) => (
                  <button 
                    key={book.id} 
                    type="button" 
                    className="book-link-item"
                    onClick={() => handleBookClick(book.id)}
                    style={{ cursor: 'pointer', textAlign: 'left' }}
                  >
                    {book.title} 📖
                  </button>
                ))}
              </div>
            </div>

            <div className="tang-kinh-stats">
              <span>📖 Tổng số lượt tụng kinh toàn đạo: <b>{totalDocKinhCount}</b></span>
            </div>

            <button onClick={handleGoMo} className="momo-button">
              🪵 Gõ Mõ Tích Công Đức
            </button>
          </>
        )}
      </div>

      {/* MODAL HIỂN THỊ SƠ ĐỒ KPS (IMAGE) */}
      {showSodoModal && (
        <div 
          onClick={() => setShowSodoModal(false)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div 
            style={{ 
              position: 'relative', 
              background: '#1e293b', 
              padding: '15px', 
              borderRadius: '12px',
              border: '1px solid #475569',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
            }}
            onClick={(e) => e.stopPropagation()} // Chặn sự kiện nổi bọt khi click vào khung ảnh
          >
            <button 
              onClick={() => setShowSodoModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ✕
            </button>

            <img 
              src="/images/SodoKPS.png" 
              alt="Sơ Đồ KPS" 
              style={{ 
                maxWidth: '90vw', 
                maxHeight: '85vh', 
                objectFit: 'contain', 
                display: 'block',
                borderRadius: '6px'
              }} 
            />
          </div>
        </div>
      )}

      {/* KHUNG CHAT THU GỌN Ở GÓC MÀN HÌNH */}
      <div className={`floating-chat-wrapper ${isChatOpen ? 'open' : 'closed'}`}>
        {!isChatOpen ? (
          <button className="chat-toggle-pill" onClick={() => setIsChatOpen(true)}>
            💬 Góc Trò Chuyện Tàng Kinh Các
          </button>
        ) : (
          <div className="floating-chat-box">
            <header className="float-chat-header">
              <span>💬 Trò chuyện cộng đồng</span>
              <button className="close-chat-btn" onClick={() => setIsChatOpen(false)}>×</button>
            </header>

            <div className="float-chat-messages" ref={chatScrollRef}>
              {chatMessages.length === 0 ? (
                <div className="chat-empty">Chưa có lời nhắn nào.</div>
              ) : (
                chatMessages.map((msg) => {
                  const isMine = msg.username === username;
                  return (
                    <div key={msg.id} className={`float-msg ${isMine ? 'my-msg' : ''}`}>
                      <div className="float-msg-meta">
                        <strong>{msg.sender}</strong>
                        <time>{msg.time}</time>
                      </div>
                      <div className="float-msg-bubble">{msg.text}</div>
                    </div>
                  );
                })
              )}
            </div>

            <form className="float-chat-form" onSubmit={handleSendChat}>
              <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                placeholder="Viết lời nhắn..." 
                maxLength={300}
              />
              <button type="submit">Gửi</button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .tang-kinh-container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 20px;
          color: #f4ead8;
          background: #171d2b;
          border: 1px solid #34394a;
          border-radius: 16px;
          box-sizing: border-box;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .tang-kinh-header-bar {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .audio-toggle-btn {
          padding: 6px 14px;
          border: 1px solid #475569;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .audio-toggle-btn.active { background: #065f46; color: #a7f3d0; border-color: #047857; }
        .audio-toggle-btn.muted { background: #7f1d1d; color: #fca5a5; border-color: #991b1b; }
        .tang-kinh-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 750px;
          background: #202737;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #34394a;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .tang-kinh-title { color: #ffb703; margin: 0 0 5px 0; font-size: 22px; letter-spacing: 1px; transition: opacity 0.2s; }
        .tang-kinh-title:hover { opacity: 0.8; }
        .tang-kinh-subtitle { color: #b9ad9b; font-size: 12px; margin-bottom: 15px; }
        .tang-kinh-banner {
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 15px;
          border: 1px solid rgba(232,189,112,.35);
          box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
        }
        .tang-kinh-img { width: 100%; height: 280px; object-fit: cover; display: block; }
        
        .book-links-section {
          width: 100%;
          background: #171f2d;
          border: 1px solid #384255;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
          text-align: left;
        }
        .book-links-section h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #f7dfad;
        }
        .book-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 8px;
        }
        .book-link-item {
          display: block;
          width: 100%;
          padding: 8px 12px;
          background: #222d40;
          color: #e2e8f0;
          text-decoration: none;
          border-radius: 6px;
          font-size: 12px;
          border: 1px solid #465064;
          transition: background 0.2s, border-color 0.2s;
        }
        .book-link-item:hover {
          background: #30394a;
          border-color: #c59b5c;
          color: #ffb703;
        }

        .tang-kinh-stats {
          margin: 10px 0 15px 0;
          padding: 8px 15px;
          background: #171f2d;
          border: 1px solid #384255;
          border-radius: 20px;
          font-size: 12px;
          color: #f7dfad;
        }
        .tang-kinh-stats b { color: #fff; }
        .momo-button {
          padding: 10px 22px;
          background: #b45309;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          box-shadow: 0 4px 12px rgba(180, 83, 9, 0.4);
        }
        .momo-button:hover { background: #d97706; transform: translateY(-2px); }

        .floating-chat-wrapper {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 100;
        }
        .chat-toggle-pill {
          padding: 10px 16px;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: background 0.2s;
        }
        .chat-toggle-pill:hover { background: #2563eb; }
        .floating-chat-box {
          width: 320px;
          height: 400px;
          background: #1e293b;
          border: 1px solid #475569;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .float-chat-header {
          padding: 10px 14px;
          background: #0f172a;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: bold;
          color: #f7dfad;
          border-bottom: 1px solid #334155;
        }
        .close-chat-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
        }
        .float-chat-messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 11px;
        }
        .float-msg { max-width: 85%; align-self: flex-start; }
        .float-msg.my-msg { align-self: flex-end; }
        .float-msg-meta { display: flex; gap: 6px; margin-bottom: 2px; font-size: 9px; color: #94a3b8; }
        .float-msg-meta strong { color: #f7dfad; }
        .float-msg-bubble {
          padding: 6px 10px;
          background: #334155;
          color: #f1f5f9;
          border-radius: 8px;
          line-height: 1.4;
          word-break: break-word;
        }
        .my-msg .float-msg-bubble { background: #b45309; color: #fff; }
        .chat-empty { text-align: center; color: #94a3b8; margin-top: auto; margin-bottom: auto; }
        .float-chat-form {
          display: flex;
          padding: 8px;
          background: #0f172a;
          border-top: 1px solid #334155;
          gap: 6px;
        }
        .float-chat-form input {
          flex: 1;
          padding: 6px 10px;
          background: #1e293b;
          border: 1px solid #475569;
          border-radius: 6px;
          color: #fff;
          font-size: 11px;
          outline: none;
        }
        .float-chat-form button {
          padding: 6px 12px;
          background: #b45309;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 11px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};