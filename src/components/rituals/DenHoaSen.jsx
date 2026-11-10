import React from 'react';
import { db } from '../../firebase';
import { ref, push, update, remove, onDisconnect } from 'firebase/database';

export default function DenHoaSen({ currentUser, queueList = [], loiNguyetInput = '', setNotice }) {
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

    const finalLoiNguyen = loiNguyetInput.trim() || 'Thắp đèn hoa sen, tâm ngời trí sáng';

    await push(ref(db, 'incense_queue'), {
      username,
      fullName,
      ritualType: 'den',
      loiNguyen: finalLoiNguyen,
      timestamp: Date.now(),
    });

    push(ref(db, 'logs'), {
      text: `${fullName} đã xếp hàng chờ dâng Đèn hoa sen 🪷.`,
      time: new Date().toLocaleTimeString(),
    });

    setNotice('Đã thêm đạo hữu vào hàng đợi dâng Đèn hoa sen.');
  };

  return (
    <button
      type="button"
      className="action-item action-active"
      onClick={handleActionClick}
      title="Đèn hoa sen"
    >
      <span className="action-icon">🪷</span>
      <span className="action-label">Đèn hoa sen</span>
    </button>
  );
}

// Hàm thực thi khi đến lượt dâng Đèn hoa sen
DenHoaSen.executeRitual = async (username, fullName, loiNguyen, onComplete) => {
  const currentIncenseRef = ref(db, 'global_state/currentIncenser');
  onDisconnect(currentIncenseRef).remove();
  const userOnlineRef = ref(db, `online_users/${username}`);

  await update(userOnlineRef, {
    isIncensing: true,
    x: 50,
    status: `Đang thắp đèn hoa sen: “${loiNguyen}” 🪷`,
  });

  push(ref(db, 'logs'), {
    text: `${fullName} dâng Đèn hoa sen cúng Phật: “${loiNguyen}” 🪷`,
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