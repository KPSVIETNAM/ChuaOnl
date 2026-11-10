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
import Leaderboard from './Leaderboard';
import DangHuong from './rituals/DangHuong';
import DangHoa from './rituals/DangHoa';
import DenHoaSen from './rituals/DenHoaSen';
import ThinhChuong from './rituals/ThinhChuong';

export default function ChanhDien({ currentUser, activeUsers = {}, allUsers = {}, logs = [], onBackToTamQuan, onLogout }) {
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

  // Nhạc nền
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

  // Tự động ẩn thông báo sau 4 giây
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      setNotice('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const getDots = () => '.'.repeat(dotCount);

  // Lắng nghe hàng đợi hành lễ và người đang hành lễ
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

  // Tự động dọn dẹp hàng đợi nếu phát hiện có người đã thoát (offline)
  useEffect(() => {
    if (queueList.length === 0) return;

    queueList.forEach((item) => {
      if (!activeUsers[item.username]) {
        remove(ref(db, `incense_queue/${item.id}`)).catch(() => {});
      }
    });
  }, [queueList, activeUsers]);

  // Điều phối hàng đợi trung tâm cho các hoạt động
  useEffect(() => {
    if (!username || currentIncenser || queueList.length === 0) return;

    const nextPerson = queueList[0];
    set(ref(db, 'global_state/currentIncenser'), nextPerson.username);
    remove(ref(db, `incense_queue/${nextPerson.id}`)).catch(() => {});

    if (nextPerson.username === username) {
      setIsAnimating(true);
      const type = nextPerson.ritualType || 'huong';

      switch (type) {
        case 'hoa':
          DangHoa.executeRitual(username, fullName, nextPerson.loiNguyen, () => setIsAnimating(false));
          break;
        case 'chuong':
          ThinhChuong.executeRitual(username, fullName, nextPerson.loiNguyen, () => setIsAnimating(false));
          break;
        case 'den':
          DenHoaSen.executeRitual(username, fullName, nextPerson.loiNguyen, () => setIsAnimating(false));
          break;
        case 'huong':
        default:
          DangHuong.executeRitual(username, fullName, nextPerson.loiNguyen, () => setIsAnimating(false));
          break;
      }
    }
  }, [currentIncenser, queueList, username]);

  // Lắng nghe chat realtime
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

  const handleEmergencyReset = async () => {
    await remove(ref(db, 'global_state/currentIncenser'));
    await remove(ref(db, 'incense_queue'));
    setIsAnimating(false);
    setNotice('Đã giải phóng trạng thái và làm sạch hàng đợi.');
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

  return (
    <main className="chanh-dien-container"> 
      {/* CỘT TRÁI: Không gian điện thờ chính & Các nút hành động */}
      <div className="left-column">
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

            if (user.isIncensing) status = user.status || 'Đang Lễ';
            else if (isWaiting) status = `Đang xếp hàng · Số ${queueIndex + 1}`;
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
            {/* CÁC HOẠT ĐỘNG ĐÃ TÁCH RIÊNG */}
            <DangHuong currentUser={currentUser} queueList={queueList} loiNguyetInput={loiNguyetInput} setNotice={setNotice} />
            
            <button type="button" className="action-item action-active" onClick={handleGoMo}>
              <span className="action-icon">🪵</span>
              <span className="action-label">Gõ mõ</span>
            </button>

            <DangHoa currentUser={currentUser} queueList={queueList} setNotice={setNotice} />
            
            <DenHoaSen currentUser={currentUser} queueList={queueList} loiNguyetInput={loiNguyetInput} setNotice={setNotice} />
            
            {/* Chừa chỗ sẵn sàng cho các tính năng sắp tới */}
            <ThinhChuong currentUser={currentUser} queueList={queueList} setNotice={setNotice} /> 
            {/* <DocKinh currentUser={currentUser} queueList={queueList} setNotice={setNotice} /> */}
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
                  ? `Đang ở vị trí số ${myQueueNumber} trong hàng đợi.`
                  : 'Chọn hành lễ bên trên để xếp hàng.'}
              </span>
              <span className="helper-text" style={{ color: '#e8bd70' }}>
                Hệ thống tự động tuần tự từng người.
              </span>
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
      </div>

      {/* CỘT PHẢI: Bảng Công Đức, Nhật Ký & Khung Chat */}
      <div className="right-column">
        <Leaderboard allUsers={allUsers} logs={logs} />

        <section className="community-chat" aria-label="Trò chuyện cộng đồng">
          <header className="chat-heading">
            <div className="chat-heading-icon">💬</div>
            <div>
              <h2>Góc trò chuyện</h2>
              <p>Cùng chia sẻ lời chúc bình an</p>
            </div>
            <span className="chat-live"><i /> Trực tuyến</span>
          </header>

          <div className="chat-messages" ref={chatScrollRef} aria-live="polite">
            {chatMessages.length === 0 ? (
              <div className="chat-empty">
                <span>🪷</span>
                <p>Chưa có lời nhắn nào.</p>
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
              placeholder="Viết lời nhắn..."
              aria-label="Nội dung tin nhắn"
            />
            <button type="submit" disabled={!chatInput.trim()} aria-label="Gửi tin nhắn">
              Gửi <span>➤</span>
            </button>
          </form>
        </section>
      </div>

      <style>{`
        .chanh-dien-container {
          --gold: #e8bd70;
          --gold-light: #f7dfad;
          --ink: #f4ead8;
          --muted: #b9ad9b;
          width: 100%;
          max-width: 1350px;
          margin: 0 auto;
          padding: 12px;
          color: var(--ink);
          background: #171d2b;
          border: 1px solid #34394a;
          border-radius: 16px;
          box-sizing: border-box;
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          position: relative;
        }
        .top-nav-bar {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-bottom: 5px;
        }
        .nav-btn {
          padding: 6px 14px;
          background: #334155;
          color: #f8fafc;
          border: 1px solid #475569;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        .nav-btn:hover {
          background: #475569;
        }
        .logout-btn {
          background: #7f1d1d;
          border-color: #991b1b;
        }
        .logout-btn:hover {
          background: #991b1b;
        }
        .left-column {
          flex: 2;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }
        .right-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 280px;
        }
        .temple-scene {
          height: clamp(340px, 42vw, 480px);
          min-height: 340px;
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
        .temple-character { position:absolute; z-index:2; transform:translate(-50%,-50%); min-width:64px; text-align:center; transition:top 2s ease,left 2s ease; }
        .character-status { display:inline-block; max-width:190px; margin-bottom:4px; padding:4px 7px; color:#ffe3a8; background:rgba(18,22,31,.88); border:1px solid rgba(232,189,112,.3); border-radius:7px; font-size:10px; line-height:1.35; white-space:normal; text-shadow:0 1px 2px #000; }
        .cd-avatar { display:block; width:32px; height:32px; margin:0 auto; object-fit:contain; filter:drop-shadow(0 2px 3px rgba(0,0,0,.65)); }
        .character-name { margin-top:2px; color:#fff; font-size:10px; font-weight:700; text-shadow:0 1px 4px #000,0 0 5px #000; white-space:nowrap; }
        .scene-online { position:absolute; right:12px; bottom:10px; padding:5px 9px; border:1px solid rgba(255,255,255,.2); border-radius:20px; color:#f5e9d4; background:rgba(15,20,29,.72); font-size:11px; }
        .scene-online:first-letter { color:#73d69a; }
        .incense-glow { position:absolute; left:50%; top:48%; color:rgba(255,245,220,.7); font-size:38px; transform:translateX(-50%); animation:incenseFloat 2.2s ease-in-out infinite; pointer-events:none; }
        @keyframes incenseFloat { 0%{opacity:0;transform:translate(-50%,8px) scale(.8)} 50%{opacity:.7} 100%{opacity:0;transform:translate(-50%,-42px) scale(1.5)} }
        .action-section, .community-chat { padding:14px; border:1px solid #34394a; border-radius:12px; background:#202737; position: relative; }
        .section-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px; }
        .queue-pill { padding:5px 9px; color:#ffe1a5; background:#60431f; border-radius:20px; font-size:11px; white-space:nowrap; }
        .action-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:7px; }
        .action-item { width: 100%; min-width:0; min-height:65px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:5px 2px; color:#eadfcf; background:#171f2d; border:1px solid #3a4354; border-radius:9px; cursor:pointer; transition:background .18s,border-color .18s,transform .18s; box-sizing: border-box; }
        .action-item:hover { background:#30394a; border-color:#b88d4e; transform:translateY(-1px); }
        .action-icon { width:28px; height:28px; display:grid; place-items:center; font-size:22px; line-height:1; }
        .action-label { max-width:100%; color:#e9ddca; font-size:9px; line-height:1.2; text-align:center; }
        .prayer-box { margin-top:10px; padding:10px; background:#171f2d; border:1px solid #384255; border-radius:9px; }
        .prayer-suggestions { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:6px; }
        .prayer-suggestions button { padding:4px 7px; color:#e9d2a8; background:#293347; border:1px solid #465064; border-radius:20px; font-size:9px; cursor:pointer; }
        .prayer-box input, .chat-form input { min-width:0; width:100%; box-sizing:border-box; padding:8px 10px; color:#f7f0e5; background:#222d40; border:1px solid #465064; border-radius:7px; outline:none; font:inherit; font-size:11px; }
        .prayer-box input:focus, .chat-form input:focus { border-color:#c59b5c; }
        .prayer-actions { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:8px; }
        .helper-text { color:#a99f91; font-size:9px; }
        .admin-reset { margin-top:8px; padding:6px 9px; color:#e6c7a5; background:#3d3030; border:1px solid #74504a; border-radius:6px; font-size:10px; cursor:pointer; }
        .notice { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:8px; padding:8px 10px; color:#f5dfb8; background:#3b3428; border:1px solid #66553b; border-radius:7px; font-size:11px; }
        .bottom-right-notice { position: absolute; bottom: 12px; right: 14px; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.4); max-width: 320px; }
        .notice button { color:inherit; background:none; border:0; font-size:18px; cursor:pointer; }
        .chat-heading { display:flex; align-items:center; gap:8px; padding-bottom:8px; border-bottom:1px solid #394254; }
        .chat-heading-icon { width:30px; height:30px; display:grid; place-items:center; flex:none; background:#343044; border-radius:8px; font-size:16px; }
        .chat-heading > div:nth-child(2) { flex:1; min-width:0; }
        .chat-heading h2 { margin:0; color:#f4dfb8; font-size:13px; }
        .chat-heading p { margin:2px 0 0; color:var(--muted); font-size:10px; }
        .chat-live { display:flex; align-items:center; gap:4px; color:#9ed6ae; font-size:9px; white-space:nowrap; }
        .chat-live i { width:6px; height:6px; background:#62c783; border-radius:50%; }
        .chat-messages { height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding:10px 2px; scroll-behavior:smooth; }
        .chat-message { max-width:85%; align-self:flex-start; }
        .chat-message.my-message { align-self:flex-end; }
        .message-meta { display:flex; align-items:center; gap:6px; margin:0 3px 3px; }
        .message-meta strong { color:#e8c78e; font-size:9px; }
        .message-meta time { color:#8e929d; font-size:8px; }
        .message-bubble { padding:7px 9px; color:#eee6d9; background:#30394a; border:1px solid #424c60; border-radius:4px 10px 10px 10px; font-size:11px; line-height:1.4; overflow-wrap:anywhere; white-space:pre-wrap; }
        .my-message .message-bubble { color:#fff0d5; background:#59452f; border-color:#7a6040; border-radius:10px 4px 10px 10px; }
        .my-message .message-meta { justify-content:flex-end; }
        .chat-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#a99f91; text-align:center; font-size:10px; }
        .chat-empty span { font-size:22px; }
        .chat-form { display:flex; gap:6px; padding-top:8px; border-top:1px solid #394254; }
        .chat-form button { flex:none; min-width:58px; padding:0 10px; color:#211a10; background:#e1b86f; border:0; border-radius:7px; font-size:11px; font-weight:800; cursor:pointer; }
        .chat-form button:disabled { opacity:.45; cursor:not-allowed; }
        @media (max-width:900px) {
          .chanh-dien-container { flex-direction: column; }
        }
      `}</style>
    </main>
  );
}