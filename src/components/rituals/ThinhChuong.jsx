import React from 'react';
import { db } from '../../firebase';
import { ref, push, update, remove, onDisconnect } from 'firebase/database';

export default function ThinhChuong({ currentUser, queueList = [], loiNguyetInput = '', setNotice }) {
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';

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

    const finalLoiNguyen = loiNguyetInput.trim() || 'Thỉnh chuông thanh tịnh, tâm trôi nhẹ nhàng';

    await push(ref(db, 'incense_queue'), {
      username,
      fullName,
      ritualType: 'chuong',
      loiNguyen: finalLoiNguyen,
      timestamp: Date.now(),
    });

    push(ref(db, 'logs'), {
      text: `${fullName} đã xếp hàng chờ Thỉnh chuông 🔔.`,
      time: new Date().toLocaleTimeString(),
    });

    // setNotice('Đã thêm đạo hữu vào hàng đợi Thỉnh chuông.');
  };

  return (
    <button
      type="button"
      className="action-item action-active"
      onClick={handleActionClick}
      title="Thỉnh chuông"
    >
      <span className="action-icon">🔔</span>
      <span className="action-label">Thỉnh chuông</span>
    </button>
  );
}

// Hàm thực thi khi đến lượt thỉnh chuông trên chánh điện
ThinhChuong.executeRitual = async (username, fullName, loiNguyen, onComplete) => {
  // 1. Phát âm thanh thỉnh chuông
  const audio = new Audio('/audio/Tiengchuong.mp3');
  audio.currentTime = 0;
  audio.play().catch(() => {});

  const currentIncenseRef = ref(db, 'global_state/currentIncenser');
  onDisconnect(currentIncenseRef).remove();
  const userOnlineRef = ref(db, `online_users/${username}`);

  // 2. Cập nhật trạng thái nhân vật ra giữa chánh điện kèm lời nguyện
  await update(userOnlineRef, {
    isIncensing: true,
    x: 50,
    status: `Đang thỉnh chuông: “${loiNguyen || 'Thanh tịnh'}” 🔔`,
  });

  push(ref(db, 'logs'), {
    text: `${fullName} thỉnh chuông cúng Phật: “${loiNguyen || 'Thanh tịnh'}” 🔔`,
    time: new Date().toLocaleTimeString(),
  });

  // 3. Tạo hiệu ứng hình ảnh chuông và gợn sóng lan tỏa
  const templeScene = document.querySelector('.temple-scene');
  let chuongEl = document.getElementById('scene-chuong-effect');

  if (!chuongEl && templeScene) {
    chuongEl = document.createElement('div');
    chuongEl.id = 'scene-chuong-effect';
    chuongEl.style.cssText = `
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.7);
      z-index: 5;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 4s ease-in-out;
    `;

    // Thêm các lớp gợn sóng (ripple rings)
    for (let i = 0; i < 3; i++) {
      const wave = document.createElement('div');
      wave.style.cssText = `
        position: absolute;
        width: 120px;
        height: 120px;
        border: 2px solid rgba(232, 189, 112, 0.7);
        border-radius: 50%;
        animation: chuongRipple 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        animation-delay: ${i}s;
        opacity: 0;
      `;
      chuongEl.appendChild(wave);
    }

    // Thêm hình ảnh chiếc chuông ở giữa
    const img = document.createElement('img');
    img.src = '/images/thinhchuong.png';
    img.style.cssText = `
      width: 130px;
      height: 130px;
      object-fit: contain;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.8));
      opacity: 0;
      transform: scale(0.6);
      transition: opacity 1.5s ease-in-out, transform 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    chuongEl.appendChild(img);

    // Thêm CSS Keyframes cho hiệu ứng gợn sóng lan ra nếu chưa có
    if (!document.getElementById('chuong-ripple-style')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'chuong-ripple-style';
      styleSheet.innerHTML = `
        @keyframes chuongRipple {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.8);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }

    templeScene.appendChild(chuongEl);
  }

  // Kích hoạt hiệu ứng hiện dần cho chuông
  setTimeout(() => {
    const imgTag = chuongEl?.querySelector('img');
    if (imgTag) {
      imgTag.style.opacity = '1';
      imgTag.style.transform = 'scale(1)';
    }
  }, 50);

  // 4. Quá trình mờ dần từ giây thứ 4 đến giây thứ 8
  setTimeout(() => {
    if (chuongEl) {
      chuongEl.style.opacity = '0'; // Bắt đầu mờ dần từ giây thứ 4
    }
  }, 4000);

  // 5. Tổng thời gian hiệu ứng chuông là 10 giây (hoàn tất mờ hẳn ở khoảng giây thứ 8 đến 10)
  setTimeout(async () => {
    if (chuongEl) {
      chuongEl.remove();
    }

    // Đưa nhân vật trở về vị trí phía dưới (tịnh tâm)
    const randomX = Math.floor(Math.random() * 70) + 15;
    await update(userOnlineRef, {
      isIncensing: false,
      x: randomX,
      status: 'Đang tịnh tâm 🙏',
    });

    // 6. Đợi thêm 2 giây để icon người di chuyển hoàn tất về phía dưới rồi mới giải phóng hàng đợi
    setTimeout(async () => {
      await remove(currentIncenseRef);
      onDisconnect(currentIncenseRef).cancel();
      if (onComplete) onComplete();
    }, 2000);

  }, 12000); // 12000ms = 12 giây thời lượng chuông
};