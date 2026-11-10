import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import {
  ref,
  runTransaction,
  push,
  update,
  onValue,
  set,
  remove,
  onDisconnect,
} from 'firebase/database';

/**
 * Trang Chánh điện - giữ nguyên các nhánh Firebase đang dùng trong bản cũ:
 * incense_queue, global_state/currentIncenser, online_users, room_chats,
 * logs và users.
 */
export default function ChanhDien({ currentUser, activeUsers = {} }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  const [canGoMo, setCanGoMo] = useState(true);
  const [loiNguyetInput, setLoiNguyetInput] = useState(
    'Cầu bình an, vạn sự hanh thông'
  );

  const [queueList, setQueueList] = useState([]);
  const [myQueueNumber, setMyQueueNumber] = useState(null);
  const [currentIncenser, setCurrentIncenser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [notice, setNotice] = useState('');
  const chatScrollRef = useRef(null);

  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';

  // Nhạc nền: trình duyệt có thể chặn autoplay cho đến khi người dùng tương tác.
  useEffect(() => {
    const bgAudio = new Audio('/audio/amnen.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 0.2;
    bgAudio.play().catch(() => {});
    return () => bgAudio.pause();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const getDots = () => '.'.repeat(dotCount);

  // Lắng nghe hàng đợi dâng hương và người đang dâng hương.
  useEffect(() => {
    if (!username) return undefined;

    const queueRef = ref(db, 'incense_queue');
    const unsubscribeQueue = onValue(queueRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .map(([key, value]) => ({ id: key, ...value }))
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      setQueueList(list);
      const myIndex = list.findIndex((item) => item.username === username);
      setMyQueueNumber(myIndex === -1 ? null : myIndex + 1);
    });

    const currentRef = ref(db, 'global_state/currentIncenser');
    const unsubscribeCurrent = onValue(currentRef, (snapshot) => {
      setCurrentIncenser(snapshot.val());
    });

    return () => {
      unsubscribeQueue();
      unsubscribeCurrent();
    };
  }, [username]);

  // Lắng nghe chat realtime.
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
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Điều phối hàng đợi theo cơ chế cũ của ứng dụng.
  useEffect(() => {
    if (!username || currentIncenser || queueList.length === 0) return;

    const nextPerson = queueList[0];
    set(ref(db, 'global_state/currentIncenser'), nextPerson.username);
    remove(ref(db, `incense_queue/${nextPerson.id}`)).catch(() => {});

    if (nextPerson.username === username) {
      executeIncenseProcess(nextPerson.loiNguyen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIncenser, queueList, username]);

  const handleGoMo = () => {
    if (!canGoMo || !username) return;
    setCanGoMo(false);
    setTimeout(() => setCanGoMo(true), 1000);

    const audio = new Audio('/audio/mo.mp3');
    audio.currentTime = 0;
    audio.play().catch(() => {});

    runTransaction(ref(db, `users/${username}/totalCongDuc`), (count) => (count || 0) + 1);
    runTransaction(ref(db, 'global_stats/totalCongDucToanCty'), (count) => (count || 0) + 1);
    push(ref(db, 'logs'), {
      text: `${fullName} gõ mõ tích công đức!`,
      time: new Date().toLocaleTimeString(),
    });
  };

  const handleDangHuongClick = async () => {
    if (!username) return;
    if (myQueueNumber !== null) {
      setNotice('Bạn đã có trong hàng đợi dâng hương.');
      return;
    }

    const finalLoiNguyen = loiNguyetInput.trim() || 'Cầu bình an, vạn sự hanh thông';
    await push(ref(db, 'incense_queue'), {
      username,
      fullName,
      loiNguyen: finalLoiNguyen,
      timestamp: Date.now(),
    });

    push(ref(db, 'logs'), {
      text: `${fullName} đã xếp hàng chờ dâng hương.`,
      time: new Date().toLocaleTimeString(),
    });
    setNotice('Đã thêm bạn vào hàng đợi dâng hương.');
  };

  const handleEmergencyReset = async () => {
    await remove(ref(db, 'global_state/currentIncenser'));
    await remove(ref(db, 'incense_queue'));
    setIsAnimating(false);
    setNotice('Đã giải phóng trạng thái và làm sạch hàng đợi.');
  };

  const executeIncenseProcess = async (loiNguyen) => {
    setIsAnimating(true);
    const currentIncenseRef = ref(db, 'global_state/currentIncenser');
    onDisconnect(currentIncenseRef).remove();
    const userOnlineRef = ref(db, `online_users/${username}`);

    await update(userOnlineRef, {
      isIncensing: true,
      x: 50,
      status: `“${loiNguyen}”`,
    });

    push(ref(db, 'logs'), {
      text: `${fullName} dâng hương: “${loiNguyen}”`,
      time: new Date().toLocaleTimeString(),
    });

    setTimeout(async () => {
      const randomX = Math.floor(Math.random() * 70) + 15;
      await update(userOnlineRef, {
        isIncensing: false,
        x: randomX,
        status: 'Đang tịnh tâm',
      });
      await remove(currentIncenseRef);
      onDisconnect(currentIncenseRef).cancel();
      setIsAnimating(false);
    }, 6000);
  };

  const handleSendChat = (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || !username) return;

    push(ref(db, 'room_chats'), {
      sender: fullName,
      username,
      text: message.slice(0, 300),
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
    });
    setChatInput('');
  };

  const getAvatarIcon = (gender) => {
    let imgPath = '/images/khac.png';
    if (gender === 'nam') imgPath = '/images/nam.png';
    if (gender === 'nu') imgPath = '/images/nu.png';
    return <img src={imgPath} alt="" className="cd-avatar" />;
  };

  const showComingSoon = (feature) => {
    setNotice(`${feature}: đang được phát triển.`);
  };

  const actions = [
    { icon: '🕯️', label: 'Dâng hương', active: true, onClick: handleDangHuongClick },
    { icon: '🪵', label: 'Gõ mõ', active: true, onClick: handleGoMo },
    { icon: '🌸', label: 'Dâng hoa', onClick: () => showComingSoon('Dâng hoa') },
    { icon: '🪷', label: 'Đèn hoa sen', onClick: () => showComingSoon('Đèn hoa sen') },
    { icon: '🔔', label: 'Thỉnh chuông', onClick: () => showComingSoon('Thỉnh chuông') },
    { icon: '📿', label: 'Niệm Phật', onClick: () => showComingSoon('Niệm Phật') },
    { icon: '📖', label: 'Đọc kinh', onClick: () => showComingSoon('Đọc kinh') },
    { icon: '🙏', label: 'Lễ Phật', onClick: () => showComingSoon('Lễ Phật') },
    { icon: '🏮', label: 'Thả hoa đăng', onClick: () => showComingSoon('Thả hoa đăng') },
    { icon: '🧘', label: 'Tịnh tâm', onClick: () => showComingSoon('Tịnh tâm') },
  ];

  return (
    <main className="chanh-dien">
      <section className="temple-scene" aria-label="Không gian chánh điện">
        <div className="scene-vignette" />
        <div className="scene-heading">
          <span>🪷</span> ĐẠI ĐIỆN KPS <span>🪷</span>
        </div>

        {Object.entries(activeUsers).map(([activeUsername, user]) => {
          const queueIndex = queueList.findIndex((item) => item.username === activeUsername);
          const isWaiting = queueIndex !== -1;
          const topPosition = user.isIncensing ? '58%' : '85%';
          let status = '';

          if (user.isIncensing) status = user.status || 'Đang dâng hương';
          else if (isWaiting) status = `Đang đợi dâng hương · Số ${queueIndex + 1}`;
          else status = user.status ? `${user.status}${getDots()}` : `Đang tịnh tâm${getDots()}`;

          return (
            <div
              key={activeUsername}
              className="temple-character"
              style={{ left: `${user.x || 50}%`, top: topPosition }}
            >
              <div className="character-status">{status}</div>
              {getAvatarIcon(user.gender)}
              <div className="character-name">{user.fullName || activeUsername}</div>
            </div>
          );
        })}

        {isAnimating && <div className="incense-glow" aria-hidden="true">〰</div>}
        <div className="scene-online">● {Object.keys(activeUsers).length} người đang hiện diện</div>
      </section>

      <section className="action-section" aria-label="Các hoạt động tại chánh điện">
        <div className="section-heading" style={{ justifyContent: 'flex-end', marginBottom: '10px' }}>
          {myQueueNumber !== null && (
            <span className="queue-pill">Đang chờ · #{myQueueNumber}</span>
          )}
        </div>

        <div className="action-grid">
          {actions.map((action) => (
            <button
              type="button"
              key={action.label}
              className={`action-item ${action.active ? 'action-active' : 'action-coming'}`}
              onClick={action.onClick}
              title={action.label}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="prayer-box"> 
          <div className="prayer-suggestions">
            {[
              ['🕊️ Bình an', 'Cầu bình an, vạn sự hanh thông'],
              ['🏡 Gia đạo', 'Cầu gia đạo hưng thịnh, hạnh phúc'],
              ['🌿 Sức khỏe', 'Cầu sức khỏe dồi dào, thân tâm an lạc'],
              ['💼 Công việc', 'Cầu công việc thuận lợi, mọi sự hanh thông'],
            ].map(([label, value]) => (
              <button type="button" key={label} onClick={() => setLoiNguyetInput(value)}>
                {label}
              </button>
            ))}
          </div>
          <input
            id="prayer-message"
            value={loiNguyetInput}
            onChange={(event) => setLoiNguyetInput(event.target.value)}
            maxLength={160}
            placeholder="Nhập lời nguyện..."
          />
          <div className="prayer-actions">
            <span className="helper-text">
              {myQueueNumber !== null
                ? `Bạn đang ở vị trí số ${myQueueNumber} trong hàng đợi.`
                : 'Lời nguyện sẽ được gửi khi bạn chọn Dâng hương.'}
            </span>
            <button type="button" className="incense-button" onClick={handleDangHuongClick}>
              {myQueueNumber !== null ? '⏳ Đang chờ dâng hương' : '🕯️ Dâng hương cầu an'}
            </button>
          </div>
        </div>

        {currentUser?.username === 'nguyen' && (
          <button type="button" className="admin-reset" onClick={handleEmergencyReset}>
            Công cụ quản trị · Giải phóng hàng đợi
          </button>
        )}
        
        {notice && (
          <div className="notice bottom-right-notice" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} aria-label="Đóng thông báo">×</button>
          </div>
        )}
      </section>

      <section className="community-chat" aria-label="Trò chuyện cộng đồng">
        <header className="chat-heading">
          <div className="chat-heading-icon">💬</div>
          <div>
            <h2>Góc trò chuyện</h2>
            <p>Cùng thăm hỏi và chia sẻ những lời chúc bình an</p>
          </div>
          <span className="chat-live"><i /> Trực tuyến</span>
        </header>

        <div className="chat-messages" ref={chatScrollRef} aria-live="polite">
          {chatMessages.length === 0 ? (
            <div className="chat-empty">
              <span>🪷</span>
              <p>Chưa có lời nhắn nào. Hãy gửi lời chào đầu tiên.</p>
            </div>
          ) : (
            chatMessages.map((message) => {
              const isMine = message.username === username;
              return (
                <article key={message.id} className={`chat-message ${isMine ? 'my-message' : ''}`}>
                  <div className="message-meta">
                    <strong>{message.sender || 'Đạo hữu'}</strong>
                    <time>{message.time || ''}</time>
                  </div>
                  <div className="message-bubble">{message.text}</div>
                </article>
              );
            })
          )}
        </div>

        <form className="chat-form" onSubmit={handleSendChat}>
          <input
            type="text"
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            maxLength={300}
            placeholder="Viết lời nhắn cho mọi người..."
            aria-label="Nội dung tin nhắn"
          />
          <button type="submit" disabled={!chatInput.trim()} aria-label="Gửi tin nhắn">
            Gửi <span>➤</span>
          </button>
        </form>
        <div className="chat-footnote">Hãy trò chuyện văn minh và tôn trọng mọi người.</div>
      </section>

      <style>{`
        .chanh-dien {
          --gold: #e8bd70;
          --gold-light: #f7dfad;
          --ink: #f4ead8;
          --muted: #b9ad9b;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 12px;
          color: var(--ink);
          background: #171d2b;
          border: 1px solid #34394a;
          border-radius: 16px;
          box-sizing: border-box;
          position: relative;
        }
        .temple-scene {
          height: clamp(391px, 55.2vw, 586.5px);
          min-height: 391px;
          position: relative;
          overflow: hidden;
          isolation: isolate;
          border: 1px solid rgba(232,189,112,.35);
          border-radius: 12px;
          background-image: linear-gradient(180deg, rgba(13,17,27,.12), rgba(13,17,27,.16) 48%, rgba(13,17,27,.58)), url('/images/chinhdien.png');
          background-size: cover;
          background-position: center 38%;
          box-shadow: inset 0 0 55px rgba(0,0,0,.35);
        }
        .scene-vignette { position:absolute; inset:0; z-index:-1; background:linear-gradient(90deg,rgba(10,14,22,.18),transparent 35%,transparent 65%,rgba(10,14,22,.18)); }
        .scene-heading {
          position:absolute; top:17px; left:50%; transform:translateX(-50%);
          width:max-content; max-width:calc(100% - 28px); text-align:center;
          color:#ffe2a6; font-size:clamp(12px, 2vw, 17px); font-weight:800;
          letter-spacing:2px; text-shadow:0 2px 8px #000; white-space:nowrap;
        }
        .scene-heading span { color:#f2c879; }
        .altar-caption { position:absolute; top:47px; left:0; right:0; text-align:center; color:#fff1d2; font-size:12px; text-shadow:0 2px 5px #000; }
        .temple-character { position:absolute; z-index:2; transform:translate(-50%,-50%); min-width:64px; text-align:center; transition:top 2s ease,left 2s ease; }
        .character-status { display:inline-block; max-width:190px; margin-bottom:4px; padding:4px 7px; color:#ffe3a8; background:rgba(18,22,31,.88); border:1px solid rgba(232,189,112,.3); border-radius:7px; font-size:10px; line-height:1.35; white-space:normal; text-shadow:0 1px 2px #000; }
        .cd-avatar { display:block; width:32px; height:32px; margin:0 auto; object-fit:contain; filter:drop-shadow(0 2px 3px rgba(0,0,0,.65)); }
        .character-name { margin-top:2px; color:#fff; font-size:10px; font-weight:700; text-shadow:0 1px 4px #000,0 0 5px #000; white-space:nowrap; }
        .scene-online { position:absolute; right:12px; bottom:10px; padding:5px 9px; border:1px solid rgba(255,255,255,.2); border-radius:20px; color:#f5e9d4; background:rgba(15,20,29,.72); font-size:11px; }
        .scene-online:first-letter { color:#73d69a; }
        .incense-glow { position:absolute; left:50%; top:48%; color:rgba(255,245,220,.7); font-size:38px; transform:translateX(-50%); animation:incenseFloat 2.2s ease-in-out infinite; pointer-events:none; }
        @keyframes incenseFloat { 0%{opacity:0;transform:translate(-50%,8px) scale(.8)} 50%{opacity:.7} 100%{opacity:0;transform:translate(-50%,-42px) scale(1.5)} }
        .action-section,.community-chat { margin-top:12px; padding:14px; border:1px solid #34394a; border-radius:12px; background:#202737; position: relative; }
        .section-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px; }
        .queue-pill { padding:5px 9px; color:#ffe1a5; background:#60431f; border-radius:20px; font-size:11px; white-space:nowrap; }
        .action-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:7px; }
        .action-item { min-width:0; min-height:72px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; padding:7px 3px; color:#eadfcf; background:#171f2d; border:1px solid #3a4354; border-radius:9px; cursor:pointer; transition:background .18s,border-color .18s,transform .18s; }
        .action-item:hover { background:#30394a; border-color:#b88d4e; transform:translateY(-1px); }
        .action-icon { width:32px; height:32px; display:grid; place-items:center; font-size:27px; line-height:1; }
        .action-label { max-width:100%; color:#e9ddca; font-size:10px; line-height:1.2; text-align:center; }
        .action-coming .action-label { color:#a99f91; }
        .prayer-box { margin-top:12px; padding:11px; background:#171f2d; border:1px solid #384255; border-radius:9px; }
        .prayer-box label { display:block; margin-bottom:7px; color:#f0d7a9; font-size:12px; font-weight:700; }
        .prayer-suggestions { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; }
        .prayer-suggestions button { padding:5px 8px; color:#e9d2a8; background:#293347; border:1px solid #465064; border-radius:20px; font-size:10px; cursor:pointer; }
        .prayer-box input,.chat-form input { min-width:0; width:100%; box-sizing:border-box; padding:10px 11px; color:#f7f0e5; background:#222d40; border:1px solid #465064; border-radius:7px; outline:none; font:inherit; font-size:12px; }
        .prayer-box input:focus,.chat-form input:focus { border-color:#c59b5c; }
        .prayer-actions { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:9px; }
        .helper-text { color:#a99f91; font-size:10px; }
        .incense-button { flex:none; padding:8px 12px; color:#fff8eb; background:#9a642d; border:0; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; }
        .incense-button:hover { background:#b47b3e; }
        .admin-reset { margin-top:9px; padding:6px 9px; color:#e6c7a5; background:#3d3030; border:1px solid #74504a; border-radius:6px; font-size:10px; cursor:pointer; }
        .notice { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:9px; padding:8px 10px; color:#f5dfb8; background:#3b3428; border:1px solid #66553b; border-radius:7px; font-size:11px; }
        .bottom-right-notice {
          position: absolute;
          bottom: 12px;
          right: 14px;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          max-width: 320px;
        }
        .notice button { color:inherit; background:none; border:0; font-size:18px; cursor:pointer; }
        .chat-heading { display:flex; align-items:center; gap:10px; padding-bottom:11px; border-bottom:1px solid #394254; }
        .chat-heading-icon { width:35px; height:35px; display:grid; place-items:center; flex:none; background:#343044; border-radius:10px; font-size:19px; }
        .chat-heading > div:nth-child(2) { flex:1; min-width:0; }
        .chat-live { display:flex; align-items:center; gap:5px; color:#9ed6ae; font-size:10px; white-space:nowrap; }
        .chat-live i { width:7px; height:7px; background:#62c783; border-radius:50%; }
        .chat-messages { height:230px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding:12px 3px; scroll-behavior:smooth; }
        .chat-message { max-width:82%; align-self:flex-start; }
        .chat-message.my-message { align-self:flex-end; }
        .message-meta { display:flex; align-items:center; gap:8px; margin:0 4px 4px; }
        .message-meta strong { color:#e8c78e; font-size:10px; }
        .message-meta time { color:#8e929d; font-size:9px; }
        .message-bubble { padding:8px 10px; color:#eee6d9; background:#30394a; border:1px solid #424c60; border-radius:4px 11px 11px 11px; font-size:12px; line-height:1.5; overflow-wrap:anywhere; white-space:pre-wrap; }
        .my-message .message-bubble { color:#fff0d5; background:#59452f; border-color:#7a6040; border-radius:11px 4px 11px 11px; }
        .my-message .message-meta { justify-content:flex-end; }
        .chat-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#a99f91; text-align:center; font-size:11px; }
        .chat-empty span { font-size:25px; }
        .chat-form { display:flex; gap:8px; padding-top:10px; border-top:1px solid #394254; }
        .chat-form button { flex:none; min-width:68px; padding:0 12px; color:#211a10; background:#e1b86f; border:0; border-radius:7px; font-size:12px; font-weight:800; cursor:pointer; }
        .chat-form button:disabled { opacity:.45; cursor:not-allowed; }
        .chat-form button span { margin-left:3px; }
        .chat-footnote { margin-top:7px; color:#888e9b; font-size:9px; text-align:center; }
        @media (max-width:600px) {
          .chanh-dien { padding:7px; border-radius:10px; }
          .temple-scene { height:448.5px; min-height:368px; background-position:center center; }
          .scene-heading { letter-spacing:1px; }
          .action-section,.community-chat { padding:10px; }
          .action-grid { grid-template-columns:repeat(5,minmax(0,1fr)); gap:5px; }
          .action-item { min-height:65px; padding:5px 1px; }
          .action-icon { width:32px; height:32px; font-size:25px; }
          .action-label { font-size:9px; }
          .prayer-actions { align-items:stretch; flex-direction:column; }
          .incense-button { width:100%; }
          .chat-messages { height:210px; }
          .bottom-right-notice { bottom: 8px; right: 8px; left: 8px; max-width: none; }
        }
        @media (max-width:360px) {
          .action-label { font-size:8px; }
          .action-grid { gap:3px; }
        }
      `}</style>
    </main>
  );
}