import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { ref, push, update, remove, onDisconnect, runTransaction, onValue } from 'firebase/database';

export default function TinhTamDien({ currentUser, queueList = [], loiNguyetInput = '', setNotice }) {
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';

  // Khóa lưu trạng thái Bật/Tắt riêng cho từng tài khoản trong localStorage
  const bgAudioKey = `tinhtamdien_bgaudio_${username || 'guest'}`;
  const moKey = `tinhtamdien_mo_${username || 'guest'}`;

  const [isBgAudioPlaying, setIsBgAudioPlaying] = useState(() => {
    const saved = localStorage.getItem(bgAudioKey);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isMoAutoPlaying, setIsMoAutoPlaying] = useState(() => {
    const saved = localStorage.getItem(moKey);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [totalTinhTamCount, setTotalTinhTamCount] = useState(0);
  const [myCongDuc, setMyCongDuc] = useState(0);
  
  const bgAudioRef = useRef(null);
  const moIntervalRef = useRef(null);

  // 1. Lắng nghe thống kê toàn hệ thống và cá nhân
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

  // 2. Quản lý Nhạc nền amnen.mp3 độc lập
  useEffect(() => {
    bgAudioRef.current = new Audio('/audio/amnen.mp3');
    bgAudioRef.current.loop = true;
    bgAudioRef.current.volume = 0.2;

    if (isBgAudioPlaying) {
      bgAudioRef.current.play().catch(() => {});
    }

    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Quản lý Vòng lặp Gõ mõ tự động mỗi 4s độc lập
  useEffect(() => {
    if (isMoAutoPlaying) {
      startMoInterval();
    } else {
      stopMoInterval();
    }

    return () => stopMoInterval();
  }, [isMoAutoPlaying]);

  const startMoInterval = () => {
    if (moIntervalRef.current) return;
    moIntervalRef.current = setInterval(() => {
      playMoSoundWithRipple();
    }, 4000);
  };

  const stopMoInterval = () => {
    if (moIntervalRef.current) {
      clearInterval(moIntervalRef.current);
      moIntervalRef.current = null;
    }
  };

  // Hàm phát tiếng mõ kèm hiệu ứng gợn sóng lan tỏa
  const playMoSoundWithRipple = () => {
    const moAudio = new Audio('/audio/mo.mp3');
    moAudio.currentTime = 0;
    moAudio.play().catch(() => {});

    triggerRippleEffect();
  };

  // Hiệu ứng gợn sóng tỏa ra từ khu vực trung tâm (hoặc banner tịnh tâm)
  const triggerRippleEffect = () => {
    const banner = document.querySelector('.tinh-tam-banner');
    if (!banner) return;

    const ripple = document.createElement('div');
    ripple.className = 'ripple-ring';
    banner.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 1500);
  };

  // Nút gạt bật/tắt nhạc nền
  const toggleBgAudio = () => {
    if (!bgAudioRef.current) return;
    if (isBgAudioPlaying) {
      bgAudioRef.current.pause();
      setIsBgAudioPlaying(false);
      localStorage.setItem(bgAudioKey, JSON.stringify(false));
    } else {
      bgAudioRef.current.play().catch(() => {});
      setIsBgAudioPlaying(true);
      localStorage.setItem(bgAudioKey, JSON.stringify(true));
    }
  };

  // Nút gạt bật/tắt mõ tự động
  const toggleMoAuto = () => {
    const nextState = !isMoAutoPlaying;
    setIsMoAutoPlaying(nextState);
    localStorage.setItem(moKey, JSON.stringify(nextState));
  };

  // 4. Gõ mõ thủ công: Phát âm thanh, tạo gợn sóng và RESET nhịp 4s của mõ tự động
  const handleManualGoMo = () => {
    if (!username) return;

    playMoSoundWithRipple();

    if (isMoAutoPlaying) {
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
      {/* Các nút gạt điều khiển âm thanh riêng biệt */}
      <div className="tinh-tam-top-bar">
        <button onClick={toggleBgAudio} className={`audio-toggle-btn ${isBgAudioPlaying ? 'active' : 'muted'}`}>
          {isBgAudioPlaying ? '🔊 Nhạc nền: Bật' : '🔇 Nhạc nền: Tắt'}
        </button>

        <button onClick={toggleMoAuto} className={`audio-toggle-btn ${isMoAutoPlaying ? 'active' : 'muted'}`}>
          {isMoAutoPlaying ? '🪵 Mõ tự động (4s): Bật' : '🪵 Mõ tự động (4s): Tắt'}
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
          justify-content: flex-end;
          gap: 10px;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
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
          position: relative;
        }
        .tinh-tam-img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          display: block;
        }
        /* CSS Hiệu ứng gợn sóng lan tỏa */
        .ripple-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          border: 2px solid rgba(247, 223, 173, 0.8);
          border-radius: 50%;
          animation: rippleEffect 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
          pointer-events: none;
          z-index: 10;
        }
        @keyframes rippleEffect {
          0% {
            width: 20px;
            height: 20px;
            opacity: 1;
          }
          100% {
            width: 350px;
            height: 350px;
            opacity: 0;
          }
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
          border-radius: 20px;
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