import React from 'react';
import { db } from '../../firebase';
import { ref, push, update, remove, onDisconnect } from 'firebase/database';

export default function DangHoa({ currentUser, queueList = [], activeUsers = {}, setNotice }) {
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';

  // 1. Logic khi bấm nút Dâng hoa
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

    // Đẩy vào hàng đợi chung với loại hành động là 'hoa'
    await push(ref(db, 'incense_queue'), {
      username,
      fullName,
      ritualType: 'hoa', 
      loiNguyen: 'Dâng hoa cúng Phật, tâm an duyên lành',
      timestamp: Date.now(),
    });

    push(ref(db, 'logs'), {
      text: `${fullName} đã xếp hàng chờ Dâng hoa 🌸.`,
      time: new Date().toLocaleTimeString(),
    });

    // setNotice('Đã thêm đạo hữu vào hàng đợi Dâng hoa.');
  };

  // 2. Logic thực thi khi đến lượt lên chánh điện (Được gọi từ ChanhDien)
  const executeRitual = async (onComplete) => {
    const currentIncenseRef = ref(db, 'global_state/currentIncenser');
    onDisconnect(currentIncenseRef).remove();
    const userOnlineRef = ref(db, `online_users/${username}`);

    // Đưa nhân vật ra giữa chánh điện
    await update(userOnlineRef, {
      isIncensing: true,
      x: 50,
      status: 'Đang dâng hoa cúng Phật 🌸',
    });

    push(ref(db, 'logs'), {
      text: `${fullName} đã lên chánh điện dâng hoa cúng Phật 🌸`,
      time: new Date().toLocaleTimeString(),
    });

    // Hành lễ trong 6 giây, sau đó trả về vị trí tịnh tâm ngẫu nhiên
    setTimeout(async () => {
      const randomX = Math.floor(Math.random() * 70) + 15;
      await update(userOnlineRef, {
        isIncensing: false,
        x: randomX,
        status: 'Đang tịnh tâm 🙏',
      });

      await remove(currentIncenseRef);
      onDisconnect(currentIncenseRef).cancel();
      
      if (onComplete) onComplete(); // Báo cho chánh điện biết đã xong để nhường lượt tiếp theo
    }, 6000);
  };

  // Gắn hàm execute vào đối tượng hoặc quản lý qua props tùy ý, 
  // ở đây ta trả về nút bấm giao diện:
  return (
    <button
      type="button"
      className="action-item action-active"
      onClick={handleActionClick}
      title="Dâng hoa"
    >
      <span className="action-icon">🌸</span>
      <span className="action-label">Dâng hoa</span>
    </button>
  );
}

// Export kèm theo hàm xử lý hành động để ChanhDien có thể gọi khi tới lượt
DangHoa.executeRitual = async (username, fullName, onComplete) => {
  const currentIncenseRef = ref(db, 'global_state/currentIncenser');
  onDisconnect(currentIncenseRef).remove();
  const userOnlineRef = ref(db, `online_users/${username}`);

  await update(userOnlineRef, {
    isIncensing: true,
    x: 50,
    status: 'Đang dâng hoa cúng Phật 🌸',
  });

  push(ref(db, 'logs'), {
    text: `${fullName} đã lên chánh điện dâng hoa cúng Phật 🌸`,
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