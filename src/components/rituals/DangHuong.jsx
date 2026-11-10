import React from 'react';
import { db } from '../../firebase';
import { ref, push, update, remove, onDisconnect } from 'firebase/database';

export default function DangHuong({ currentUser, queueList = [], loiNguyetInput = '', setNotice }) {
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

    const finalLoiNguyen = loiNguyetInput.trim() || 'Cầu bình an, vạn sự hanh thông';

    await push(ref(db, 'incense_queue'), {
      username,
      fullName,
      ritualType: 'huong',
      loiNguyen: finalLoiNguyen,
      timestamp: Date.now(),
    });

    push(ref(db, 'logs'), {
      text: `${fullName} đã xếp hàng chờ Dâng hương 🕯️.`,
      time: new Date().toLocaleTimeString(),
    });

    setNotice('Đã thêm đạo hữu vào hàng đợi Dâng hương.');
  };

  return (
    <button
      type="button"
      className="action-item action-active"
      onClick={handleActionClick}
      title="Dâng hương"
    >
      <span className="action-icon">🕯️</span>
      <span className="action-label">Dâng hương</span>
    </button>
  );
}

// Hàm thực thi hành động khi đến lượt lên Chánh Điện
DangHuong.executeRitual = async (username, fullName, loiNguyen, onComplete) => {
  const currentIncenseRef = ref(db, 'global_state/currentIncenser');
  onDisconnect(currentIncenseRef).remove();
  const userOnlineRef = ref(db, `online_users/${username}`);

  await update(userOnlineRef, {
    isIncensing: true,
    x: 50,
    status: `Đang dâng hương: “${loiNguyen}” 🕯️`,
  });

  push(ref(db, 'logs'), {
    text: `${fullName} dâng hương cầu an: “${loiNguyen}” 🕯️`,
    time: new Date().toLocaleTimeString(),
  });

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