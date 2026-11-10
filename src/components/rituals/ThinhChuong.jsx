import React, { useState, useEffect } from 'react';
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

    setNotice('Đã thêm đạo hữu vào hàng đợi Thỉnh chuông.');
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

// Hàm thực thi khi đến lượt thỉnh chuông trên chánh điện (Nhận đúng 4 tham số khớp với switch-case)
ThinhChuong.executeRitual = async (username, fullName, loiNguyen, onComplete) => {
  // 1. Phát âm thanh thỉnh chuông
  const audio = new Audio('/audio/Tiengchuong.mp3');
  audio.currentTime = 0;
  audio.play().catch(() => {});

  const currentIncenseRef = ref(db, 'global_state/currentIncenser');
  onDisconnect(currentIncenseRef).remove();
  const userOnlineRef = ref(db, `online_users/${username}`);

  // 2. Cập nhật trạng thái nhân vật ra giữa chánh điện kèm lời nguyện
  const finalNguyen = loiNguyetInputText => loiNguyetInputText || 'Thỉnh chuông thanh tịnh';
  await update(userOnlineRef, {
    isIncensing: true,
    x: 50,
    status: `Đang thỉnh chuông: “${loiNguyen || 'Thanh tịnh'}” 🔔`,
  });

  push(ref(db, 'logs'), {
    text: `${fullName} thỉnh chuông cúng Phật: “${loiNguyen || 'Thanh tịnh'}” 🔔`,
    time: new Date().toLocaleTimeString(),
  });

  // 3. Hiệu ứng hiển thị hình ảnh chuông hiện dần (Fade-in / Zoom-in) giữa màn hình nếu có container hỗ trợ
  // (Đã được tích hợp mượt mà trong vòng đời thực thi 6 giây)
  const chuongOverlayId = 'fade-in-chuong-overlay';
  let overlay = document.getElementById(chuongOverlayId);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = chuongOverlayId;
    overlay.style.cssText = `
      position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
      background: rgba(0, 0, 0, 0.4); z-index: 999; pointer-events: none;
      opacity: 0; transition: opacity 1s ease-in-out;
    `;
    const img = document.createElement('img');
    img.src = '/images/thinhchuong.png';
    img.style.cssText = `
      width: 280px; height: 280px; object-fit: contain;
      transform: scale(0.6); transition: transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      filter: drop-shadow(0 15px 25px rgba(0,0,0,0.8));
    `;
    overlay.appendChild(img);
    document.body.appendChild(overlay);
  }

  // Kích hoạt hiệu ứng hiện dần
  setTimeout(() => {
    overlay.style.opacity = '1';
    overlay.querySelector('img').style.transform = 'scale(1)';
  }, 50);

  // 4. Sau 6 giây hoàn tất hành lễ, thu hồi hình ảnh chuông và trả nhân vật về vị trí cũ
  setTimeout(async () => {
    overlay.style.opacity = '0';
    overlay.querySelector('img').style.transform = 'scale(0.6)';
    setTimeout(() => overlay.remove(), 1000); // Xóa DOM sau khi hiệu ứng mờ dần kết thúc

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