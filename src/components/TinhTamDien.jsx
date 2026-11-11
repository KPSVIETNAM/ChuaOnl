import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, push, update, remove, onDisconnect, runTransaction, onValue } from 'firebase/database';

export default function TinhTamDien({ currentUser, queueList = [], loiNguyetInput = '', setNotice, onBack }) {
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';

  // Khóa lưu trạng thái Bật/Tắt âm thanh riêng cho từng tài khoản trong localStorage
  const storageKey = `tinhtamdien_audio_${username || 'guest'}`;
  const [isAudioPlaying, setIsAudioPlaying] = useState(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [totalTinhTamCount, setTotalTinhTamCount] = useState(0);
  const [myCongDuc, setMyCongDuc] = useState(0);
  
  const bgAudioRef = useRef(null);
  const moIntervalRef = useRef(null);

  // 1. Lắng nghe tổng số lượt tịnh tâm toàn hệ thống và công đức cá nhân
  useEffect(() => {
    if (!username) return;

    const tinhTamRef = ref(db, 'global_stats/totalTinhTamToanCty');
    const unsubTinhTam = onValue(tinhTamRef, (snapshot) => {
      setTotalTinhTamCount(snapshot.val() || 0);
    });

    const myUserRef = ref(db, `users/${username}/totalCongDuc`);
    const unsubCongDuc = onValue(myUserRef, (snapshot) => {
      setMyCongDuc(snapshot.val() || 0);
    });

    return () => {
      unsubTinhTam();
      unsubCongDuc();
    };
  }, [username]);

  // 2. Quản lý nhạc nền amnen.mp3 và vòng lặp gõ mõ mỗi 4 giây
  useEffect(() => {
    bgAudioRef.current = new Audio('/audio/amnen.mp3');
    bgAudioRef.current.loop = true;
    bgAudioRef.current.volume = 0.2;

    if (isAudioPlaying) {
      bgAudioRef.current.play().catch(() => {});
      startMoInterval();
    }

    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
      stopMoInterval();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startMoInterval = () => {
    if (moIntervalRef.current) return;
    moIntervalRef.current = setInterval(() => {
      playMoSound();
    }, 4000);
  };

  const stopMoInterval = () => {
    if (moIntervalRef.current) {
      clearInterval(moIntervalRef.current);
      moIntervalRef.current = null;
    }
  };

  // Hàm phát tiếng mõ chung
  const playMoSound = () => {
    const moAudio = new Audio('/audio/mo.mp3');
    moAudio.currentTime = 0;
    moAudio.play().catch(() => {});
  };

  // Hàm chuyển đổi Bật/Tắt âm thanh & lưu localStorage
  const toggleAudio = () => {
    if (!bgAudioRef.current) return;

    if (isAudioPlaying) {
      bgAudioRef.current.pause();
      stopMoInterval();
      setIsAudioPlaying(false);
      localStorage.setItem(storageKey, JSON.stringify(false));
    } else {
      bgAudioRef.current.play().catch(() => {});
      startMoInterval();
      setIsAudioPlaying(true);
      localStorage.setItem(storageKey, JSON.stringify(true));
    }
  };

  // 3. Hành động Gõ Mõ Thủ Công: Phát tiếng mõ ngay lập tức và RESET lại chu kỳ 4s
  const handleManualGoMo = () => {
    if (!username) return;

    // Phát âm thanh gõ mõ ngay khi bấm
    playMoSound();

    // Nếu nhạc nền & mõ tự động đang bật, ta reset lại đếm giờ 4s để tránh bị trùng lặp âm thanh dồn dập
    if (isAudioPlaying) {
      stopMoInterval();
      startMoInterval();
    }

    runTransaction(ref(db, `users/${username}/totalCongDuc`), (count) => (count || 0) + 1);
    runTransaction(ref(db, 'global_stats/totalCongDucToanCty'), (count) => (count || 0) + 1);

    push(ref(db, 'logs'), {
      text: `${fullName} gõ mõ tĩnh tâm tại Tịnh Tâm Điện!`,
      time: new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className="tinh-tam-container">
      {/* Thanh điều khiển phụ ở góc trên Tịnh Tâm Điện */}
      <div className="tinh-tam-top-bar">
        {onBack && (
          <button onClick={onBack} className="back-button">
            ← Quay lại Chánh Điện
          </button>
        )}

        <button onClick={toggleAudio} className={`audio-toggle-btn ${isAudioPlaying ? 'active' : 'muted'}`}>
          {isAudioPlaying ? '🔊 Âm thanh & Mõ tự động: Bật' : '🔇 Âm thanh & Mõ tự động: Tắt'}
        </button>
      </div>

      <div className="tinh-tam-content">
        <h2 className="tinh-tam-title">🧘 TỊNH TÂM ĐIỆN 🧘</h2>
        <p className="tinh-tam-subtitle">Lắng nghe tiếng mõ nhịp nhàng, quay về nội tâm tĩnh lặng</p>

        <div className="tinh-tam-banner">
          <img 
            src="/images/tinhtamdien.jpg" 
            alt="Tịnh Tâm Điện" 
            className="tinh-tam-img"
          />
        </div>

        {/* Thống kê công đức bản thân & toàn đạo */}
        <div className="tinh-tam-stats-group">
          <div className="tinh-tam-stat-pill">
            <span>📿 Công đức của bạn:</span> <b>{myCongDuc}</b>
          </div>
          <div className="tinh-tam-stat-pill">
            <span>🧘 Tổng lượt tịnh tâm toàn đạo:</span> <b>{totalTinhTamCount}</b>
          </div>
        </div>

        {/* Nút gõ mõ thủ công */}
        <button onClick={handleManualGoMo} className="manual-momo-button">
          🪵 Gõ Mõ Tích Công Đức
        </button>
      </div>

      <style>{`
        .tinh-tam-container {
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
        }
        .tinh-tam-top-bar {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .back-button {
          padding: 6px 14px;
          background: #334155;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          transition: background 0.2s;
        }
        .back-button:hover {
          background: #475569;
        }
        .audio-toggle-btn {
          padding: 6px 14px;
          border: 1px solid #475569;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
          transition: all 0.2s;
        }
        .audio-toggle-btn.active {
          background: #065f46;
          color: #a7f3d0;
          border-color: #047857;
        }
        .audio-toggle-btn.muted {
          background: #7f1d1d;
          color: #fca5a5;
          border-color: #991b1b;
        }
        .tinh-tam-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 700px;
          background: #202737;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #34394a;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .tinh-tam-title {
          color: #ffb703;
          margin: 0 0 5px 0;
          font-size: 22px;
          letter-spacing: 1px;
        }
        .tinh-tam-subtitle {
          color: #b9ad9b;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .tinh-tam-banner {
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 20px;
          border: 1px solid rgba(232,189,112,.35);
          box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
        }
        .tinh-tam-img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          display: block;
        }
        .tinh-tam-stats-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 20px;
        }
        .tinh-tam-stat-pill {
          padding: 8px 15px;
          background: #171f2d;
          border: 1px solid #384255;
          border-radius: 20px; tiếng gõ mõ
          font-size: 12px;
          color: #f7dfad;
        }
        .tinh-tam-stat-pill b {
          color: #fff;
        }
        .manual-momo-button {
          padding: 10px 24px;
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
        .manual-momo-button:hover {
          background: #d97706;
          transform: translateY(-2px);
        }
        .manual-momo-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

// Hàm thực thi khi đến lượt Tịnh Tâm trên chánh điện
TinhTamDien.executeRitual = async (username, fullName, loiNguyen, onComplete) => {
  const audio = new Audio('/audio/mo.mp3');
  audio.currentTime = 0;
  audio.play().catch(() => {});

  const currentIncenseRef = ref(db, 'global_state/currentIncenser');
  onDisconnect(currentIncenseRef).remove();
  const userOnlineRef = ref(db, `online_users/${username}`);

  await update(userOnlineRef, {
    isIncensing: true,
    x: 50,
    status: `Đang tịnh tâm: “${loiNguyen || 'An lạc'}” 🧘`,
  });

  push(ref(db, 'logs'), {
    text: `${fullName} đang tịnh tâm: “${loiNguyen || 'An lạc'}” 🧘`,
    time: new Date().toLocaleTimeString(),
  });

  runTransaction(ref(db, `users/${username}/totalCongDuc`), (count) => (count || 0) + 1);
  runTransaction(ref(db, 'global_stats/totalCongDucToanCty'), (count) => (count || 0) + 1);
  runTransaction(ref(db, 'global_stats/totalTinhTamToanCty'), (count) => (count || 0) + 1);

  setTimeout(async () => {
    const randomX = Math.floor(Math.random() * 70) + 15;
    await update(userOnlineRef, {
      isIncensing: false,
      x: randomX,
      status: 'Đang tịnh tâm 🙏',
    });

    await remove(currentIncenseRef);
    onDisconnect(currentIncenseRef).cancel();
    if (onComplete) onComplete();
  }, 6000);
};