import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, update, remove, onDisconnect, runTransaction, onValue } from 'firebase/database';

export default function TinhTamDien({ currentUser, queueList = [], loiNguyetInput = '', setNotice, onBack }) {
  const [isMeditating, setIsMeditating] = useState(false);
  const [totalTinhTamCount, setTotalTinhTamCount] = useState(0);
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';

  // Lắng nghe tổng số lượt tịnh tâm toàn hệ thống
  useEffect(() => {
    const tinhTamRef = ref(db, 'global_stats/totalTinhTamToanCty');
    const unsubscribe = onValue(tinhTamRef, (snapshot) => {
      setTotalTinhTamCount(snapshot.val() || 0);
    });
    return () => unsubscribe();
  }, []);

  // Vòng lặp phát âm thanh gõ mõ mỗi 4 giây khi đang ở Tịnh Tâm Điện
  useEffect(() => {
    const interval = setInterval(() => {
      const audio = new Audio('/audio/mo.mp3');
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleActionClick = async () => {
    if (!username) return;

    if (queueList.length >= 10) {
      setNotice('Hàng đợi chánh điện hiện đã đầy (tối đa 10 người).');
      return;
    }

    if (queueList.some((item) => item.username === username)) {
      setNotice('Đạo hữu đã có trong hàng đợi hành lễ!');
      return;
    }

    const finalLoiNguyen = loiNguyetInput.trim() || 'Tịnh tâm an lạc, buông bỏ muộn phiền';

    await push(ref(db, 'incense_queue'), {
      username,
      fullName,
      ritualType: 'tinhtam',
      loiNguyen: finalLoiNguyen,
      timestamp: Date.now(),
    });

    push(ref(db, 'logs'), {
      text: `${fullName} đã xếp hàng chờ Tịnh Tâm Điện 🧘.`,
      time: new Date().toLocaleTimeString(),
    });

    setNotice('Đã thêm đạo hữu vào hàng đợi Tịnh Tâm Điện.');
  };

  return (
    <div className="tinh-tam-container">
      {onBack && (
        <button onClick={onBack} className="back-button">
          ← Quay lại Chánh Điện
        </button>
      )}

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

        <div className="tinh-tam-stats">
          <span>🧘 Tổng số lượt tịnh tâm toàn đạo: <b>{totalTinhTamCount}</b></span>
        </div>
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
        .back-button {
          align-self: flex-start;
          padding: 6px 14px;
          background: #334155;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 15px;
          transition: background 0.2s;
        }
        .back-button:hover {
          background: #475569;
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
          height: 320px;
          object-fit: cover;
          display: block;
        }
        .tinh-tam-stats {
          margin: 10px 0;
          padding: 8px 15px;
          background: #171f2d;
          border: 1px solid #384255;
          border-radius: 20px;
          font-size: 12px;
          color: #f7dfad;
        }
        .tinh-tam-stats b {
          color: #fff;
        }
      `}</style>
    </div>
  );
}

// Hàm thực thi khi đến lượt Tịnh Tâm trên chánh điện (nếu tích hợp vào hàng đợi)
TinhTamDien.executeRitual = async (username, fullName, loiNguyen, onComplete) => {
  // Phát tiếng mõ khi bắt đầu tịnh tâm
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

  // Tăng điểm công đức và thống kê toàn hệ thống
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