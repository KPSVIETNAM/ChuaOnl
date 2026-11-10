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

// Hàm thực thi khi đến lượt thỉnh chuông trên chánh điện
ThinhChuong.executeRitual = async (username, fullName, loiNguyen, onComplete) => {
  // Phát âm thanh thỉnh chuông
  const audio = new Audio('/audio/thinhchuong.mp3');
  audio.currentTime = 0;
  audio.play().catch(() => {});

  const currentIncenseRef = ref(db, 'global_state/currentIncenser');
  onDisconnect(currentIncenseRef).remove();
  const userOnlineRef = ref(db, `online_users/${username}`);

  await update(userOnlineRef, {
    isIncensing: true,
    x: 50,
    status: `Đang thỉnh chuông: “${loiNguyen || 'Thanh tịnh'}” 🔔`,
  });

  push(ref(db, 'logs'), {
    text: `${fullName} thỉnh chuông cúng Phật: “${loiNguyen || 'Thanh tịnh'}” 🔔`,
    time: new Date().toLocaleTimeString(),
  });

  // Tăng tổng số lượt thỉnh chuông toàn hệ thống (nếu có dùng)
  // runTransaction(ref(db, 'global_stats/totalThinhChuongToanCty'), (count) => (count || 0) + 1);

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