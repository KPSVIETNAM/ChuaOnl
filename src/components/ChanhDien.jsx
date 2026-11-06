import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, runTransaction, push, update, onValue, set, remove } from 'firebase/database';

export default function ChanhDien({ currentUser, activeUsers }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  const [canGoMo, setCanGoMo] = useState(true);
  
  // State quản lý lời cầu nguyện (mặc định có chữ "Cầu: ")
  const [loiNguyetInput, setLoiNguyetInput] = useState('Cầu bình an, vạn sự hanh thông');

  const [queueList, setQueueList] = useState([]);
  const [myQueueNumber, setMyQueueNumber] = useState(null);
  const [currentIncenser, setCurrentIncenser] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef(null);

  // 1. Nhạc nền amnen.mp3
  useEffect(() => {
    const bgAudio = new Audio('/audio/amnen.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 0.2;
    bgAudio.play().catch(() => {});

    return () => {
      bgAudio.pause();
    };
  }, []);

  // 2. Hiệu ứng 3 chấm cho trạng thái tịnh tâm
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const getDots = () => '.'.repeat(dotCount);

  // 3. Lắng nghe Hàng đợi và Người đang dâng hương
  useEffect(() => {
    const queueRef = ref(db, 'incense_queue');
    const unsubscribeQueue = onValue(queueRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([key, val]) => ({ id: key, ...val }));
      list.sort((a, b) => a.timestamp - b.timestamp);
      setQueueList(list);

      const myIndex = list.findIndex(item => item.username === currentUser.username);
      if (myIndex !== -1) {
        setMyQueueNumber(myIndex + 1);
      } else {
        setMyQueueNumber(null);
      }
    });

    const currentRef = ref(db, 'global_state/currentIncenser');
    const unsubscribeCurrent = onValue(currentRef, (snapshot) => {
      setCurrentIncenser(snapshot.val());
    });

    return () => {
      unsubscribeQueue();
      unsubscribeCurrent();
    };
  }, [currentUser.username]);

  // 4. Điều phối hàng đợi tự động
  useEffect(() => {
    if (!currentIncenser && queueList.length > 0) {
      const nextPerson = queueList[0];
      
      set(ref(db, 'global_state/currentIncenser'), nextPerson.username);
      remove(ref(db, `incense_queue/${nextPerson.id}`)).catch(() => {});

      if (nextPerson.username === currentUser.username) {
        executeIncenseProcess(nextPerson.loiNguyen);
      }
    }
  }, [currentIncenser, queueList, currentUser.username]);

  // Lắng nghe chat realtime
  useEffect(() => {
    const chatRef = ref(db, 'room_chats');
    return onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      setChatMessages(Object.values(data).slice(-20));
    });
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleGoMo = () => {
    if (!canGoMo) return;
    setCanGoMo(false);
    setTimeout(() => setCanGoMo(true), 1000);

    const audio = new Audio('/audio/mo.mp3');
    audio.currentTime = 0;
    audio.play().catch(() => {});

    runTransaction(ref(db, `users/${currentUser.username}/totalCongDuc`), count => (count || 0) + 1);
    runTransaction(ref(db, 'global_stats/totalCongDucToanCty'), count => (count || 0) + 1);

    push(ref(db, 'logs'), {
      text: `${currentUser.fullName} gõ mõ tích công đức!`,
      time: new Date().toLocaleTimeString()
    });
  };

  // 5. Bấm dâng hương lấy trực tiếp từ ô textbox bên dưới
  const handleDangHuongClick = async () => {
    if (isAnimating || myQueueNumber !== null || currentIncenser === currentUser.username) {
      alert('Đạo hữu đã có trong hàng đợi hoặc đang dâng hương rồi!');
      return;
    }

    const finalLoiNguyet = loiNguyetInput.trim() || 'Cầu bình an, vạn sự hanh thông';

    const queueRef = ref(db, 'incense_queue');
    await push(queueRef, {
      username: currentUser.username,
      fullName: currentUser.fullName,
      loiNguyen: finalLoiNguyet,
      timestamp: Date.now()
    });

    push(ref(db, 'logs'), {
      text: `${currentUser.fullName} đã xếp hàng chờ dâng hương.`,
      time: new Date().toLocaleTimeString()
    });
  };

  // Thực thi quá trình dâng hương (Tốc độ đi đã được điều chỉnh chậm rãi, uy nghiêm hơn: 2.2s)
  const executeIncenseProcess = async (loiNguyen) => {
    setIsAnimating(true);

    const userOnlineRef = ref(db, `online_users/${currentUser.username}`);
    
    await update(userOnlineRef, { 
      isIncensing: true, 
      x: 50, 
      status: `"${loiNguyen}"` 
    });

    push(ref(db, 'logs'), {
      text: `${currentUser.fullName} dâng hương: "${loiNguyen}"`,
      time: new Date().toLocaleTimeString()
    });

    setTimeout(async () => {
      const randomX = Math.floor(Math.random() * 70) + 15;
      
      await update(userOnlineRef, { 
        isIncensing: false, 
        x: randomX,
        status: 'Đang tịnh tâm' 
      });

      await remove(ref(db, 'global_state/currentIncenser'));
      setIsAnimating(false);
    }, 6000);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    push(ref(db, 'room_chats'), {
      sender: currentUser.fullName,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setChatInput('');
  };


  const getAvatarIcon = (gender) => {
  let imgPath = '/images/khac.png';
  if (gender === 'nam') imgPath = '/images/nam.png';
  if (gender === 'nu') imgPath = '/images/nu.png';

  return <img src={imgPath} alt="avatar" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />;
};
  return (
    <div style={styles.container}>
      {/* KHUNG CẢNH CHÁNH ĐIỆN GIẢ 3D */}
      <div style={styles.templeScene}>
        <div style={styles.glowEffect}></div>

        <div style={styles.altar3D}>
          <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px', marginBottom: '2px' }}>
            🪷 ĐẠI HÙNG BỬU ĐIỆN 🪷
          </div>

          <div style={styles.luhuongContainer}>
            <img 
              src="/images/luhuong.png" 
              alt="Lư Hương" 
              style={styles.luhuongImg}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            
            {currentIncenser && (
              <div style={styles.smokeWrapper}>
                <div style={styles.smokeParticle}></div>
                <div style={{ ...styles.smokeParticle, animationDelay: '0.6s', left: '10px' }}></div>
                <div style={{ ...styles.smokeParticle, animationDelay: '1.2s', left: '-10px' }}></div>
                <div style={{ ...styles.smokeParticle, animationDelay: '1.8s', left: '5px' }}></div>
              </div>
            )}
          </div>
        </div>

        {Object.entries(activeUsers).map(([username, user]) => {
          const topPos = user.isIncensing ? '56%' : '86%';
          
          const queueItemIndex = queueList.findIndex(item => item.username === username);
          const isWaitingInQueue = queueItemIndex !== -1;
          const queueNumber = queueItemIndex + 1;

          let displayStatus = '';
          if (user.isIncensing) {
            displayStatus = user.status;
          } else if (isWaitingInQueue) {
            displayStatus = `Đang đợi cầu an (Số ${queueNumber})`;
          } else {
            displayStatus = user.status ? `${user.status}${getDots()}` : `Đang tịnh tâm${getDots()}`;
          }

          return (
            <div 
              key={username} 
              style={{
                ...styles.character,
                left: `${user.x || 50}%`,
                top: topPos,
                // Đã chỉnh tốc độ đi chậm rãi, từ tốn hơn (2.2 giây)
                transition: 'all 2.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div style={styles.speechBubble}>{displayStatus}</div>
              <div style={{ fontSize: '30px', transform: user.isIncensing ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.3s' }}>
                {getAvatarIcon(user.gender)}
              </div>
              <div style={styles.charName}>{user.fullName}</div>
            </div>
          );
        })}
      </div>

      {/* THANH ĐIỀU KHIỂN HÀNH ĐỘNG & Ô NHẬP LỜI CẦU NGUYỆN */}
      <div style={styles.actionPanel}>
        <div style={styles.controls}>
          <button onClick={handleGoMo} style={{ ...styles.moBtn, opacity: canGoMo ? 1 : 0.6 }}>
            🪵 GÕ MÕ (+1 Công Đức)
          </button>
          <button 
            onClick={handleDangHuongClick} 
            style={{ 
              ...styles.huongBtn, 
              backgroundColor: myQueueNumber !== null ? '#b45309' : '#047857' 
            }}
          >
            {myQueueNumber !== null 
              ? `⏳ Đang đợi (Số ${myQueueNumber})` 
              : '🕯️ DÂNG HƯƠNG CẦU AN'}
          </button>
        </div>

        {/* Khung chọn câu mẫu & nhập lời cầu nguyện */}
        <div style={styles.loiNguyetBox}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '5px' }}>
            ✨ Chọn nhanh lời cầu nguyện hoặc tự gõ:
          </div>
          <div style={styles.suggestChips}>
            <span style={styles.chip} onClick={() => setLoiNguyetInput('Cầu: Bình an, vạn sự hanh thông')}>🕊️ Bình an</span>
            <span style={styles.chip} onClick={() => setLoiNguyetInput('Cầu: Gia đạo hưng thịnh, hạnh phúc')}>🏡 Gia đạo</span>
            <span style={styles.chip} onClick={() => setLoiNguyetInput('Cầu: Tài lộc phát triển, công việc thuận lợi')}>💰 Tài lộc</span>
            <span style={styles.chip} onClick={() => setLoiNguyetInput('Cầu: Sức khỏe dồi dào, thân tâm an lạc')}>🌿 Sức khỏe</span>
          </div>
          <input 
            type="text" 
            value={loiNguyetInput}
            onChange={(e) => setLoiNguyetInput(e.target.value)}
            placeholder="Nhập lời cầu nguyện của bạn..."
            style={styles.loiNguyetInput}
          />
        </div>
      </div>

      {/* KHUNG CHAT NỘI BỘ DƯỚI CÙNG */}
      <div style={styles.chatContainer}>
        <div style={styles.chatMessages} ref={chatScrollRef}>
          {chatMessages.map((msg, idx) => (
            <div key={idx} style={styles.chatItem}>
              <span style={styles.chatTime}>[{msg.time}]</span>
              <span style={styles.chatSender}>{msg.sender}:</span>
              <span style={styles.chatText}>{msg.text}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendChat} style={styles.chatForm}>
          <input 
            type="text" 
            placeholder="Nhập lời tâm sự, thảo luận cùng đạo hữu..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={styles.chatInput}
          />
          <button type="submit" style={styles.chatSendBtn}>Gửi</button>
        </form>
      </div>

      <style>{`
        @keyframes riseSmokeThick {
          0% { transform: translateY(0) scale(1); opacity: 0.85; }
          50% { transform: translateY(-50px) scale(2); opacity: 0.5; }
          100% { transform: translateY(-100px) scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '15px', border: '1px solid #334155' },
  templeScene: { 
    position: 'relative', 
    height: '500px', 
    backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.35)), url("/images/phat.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    borderRadius: '10px', 
    overflow: 'hidden', 
    border: '1px solid #475569',
    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.7)'
  },
  glowEffect: {
    position: 'absolute',
    top: '45px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '220px',
    height: '110px',
    background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.35) 0%, rgba(0,0,0,0) 70%)',
    zIndex: 1
  },
  altar3D: { 
    position: 'absolute', 
    top: '200px', 
    left: '50%', 
    transform: 'translateX(-50%)', 
    textAlign: 'center', 
    zIndex: 2,
    padding: '6px 18px',
    background: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.75), rgba(15, 23, 42, 0.75))',
    borderRadius: '10px',
    border: '1px solid rgba(251, 191, 36, 0.4)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.4)'
  },
  luhuongContainer: {
    position: 'relative',
    marginTop: '3px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '45px'
  },
  luhuongImg: {
    width: '50px',
    height: 'auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.6))'
  },
  smokeWrapper: {
    position: 'absolute',
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '10px',
    height: '10px',
    zIndex: 5
  },
  smokeParticle: {
    position: 'absolute',
    width: '16px',
    height: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: '50%',
    filter: 'blur(4px)',
    animation: 'riseSmokeThick 2s infinite ease-out'
  },
  character: { 
    position: 'absolute', 
    transform: 'translate(-50%, -50%)', 
    textAlign: 'center', 
    zIndex: 10,
    padding: '4px 8px',
  },
  speechBubble: { 
    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
    color: '#fbbf24', 
    fontSize: '11px', 
    padding: '3px 8px', 
    borderRadius: '6px', 
    marginBottom: '4px', 
    whiteSpace: 'nowrap',
    border: '1px solid #334155',
    boxShadow: '0 3px 5px rgba(0,0,0,0.4)'
  },
  charName: { fontSize: '11px', color: '#f1f5f9', fontWeight: 'bold', marginTop: '2px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' },
  
  actionPanel: { marginTop: '12px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #334155' },
  controls: { display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '10px' },
  moBtn: { backgroundColor: '#b45309', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(180, 83, 9, 0.4)' },
  huongBtn: { backgroundColor: '#047857', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(4, 120, 87, 0.4)' },

  loiNguyetBox: { display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #334155', paddingTop: '10px' },
  suggestChips: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  chip: { backgroundColor: '#1e293b', color: '#fbbf24', border: '1px solid #475569', padding: '4px 10px', borderRadius: '15px', fontSize: '11px', cursor: 'pointer', userSelect: 'none' },
  loiNguyetInput: { width: '100%', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' },
  
  chatContainer: { marginTop: '15px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', padding: '10px' },
  chatMessages: { height: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px', paddingRight: '5px' },
  chatItem: { fontSize: '12px', color: '#cbd5e1', backgroundColor: '#1e293b', padding: '5px 8px', borderRadius: '6px' },
  chatTime: { color: '#64748b', fontSize: '10px', marginRight: '6px' },
  chatSender: { color: '#fbbf24', fontWeight: 'bold', marginRight: '6px' },
  chatText: { color: '#f8fafc' },
  chatForm: { display: 'flex', gap: '8px' },
  chatInput: { flex: 1, backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none' },
  chatSendBtn: { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }
};