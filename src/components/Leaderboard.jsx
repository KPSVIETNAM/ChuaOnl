import React from 'react';

export default function Leaderboard({ allUsers, logs }) {
  const leaderboard = Object.values(allUsers).sort((a, b) => (b.totalCongDuc || 0) - (a.totalCongDuc || 0));

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3>🏆 BẢNG CÔNG ĐỨC</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
          {leaderboard.map((u, i) => (
            <div key={u.username} style={styles.row}>
              <span><b>#{i + 1}</b> {u.fullName}</span>
              <b style={{ color: '#fb8500' }}>{u.totalCongDuc || 0}</b>
            </div>
          ))}
        </div>
      </div>
      <div style={{ 
        ...styles.section, 
        marginTop: '15px',
        maxHeight: '200px',    /* Giới hạn chiều cao tối đa (tùy chỉnh 150px - 300px tùy giao diện) */
        overflowY: 'auto'      /* Hiện thanh cuộn khi log vượt quá maxHeight */
      }}> 
        {logs.slice(-200).map((log, index) => (
          <div key={index} style={styles.logItem}>
            <span style={{ color: '#64748b', fontSize: '10px' }}>[{log.time}]</span> {log.text}
          </div>
        ))}
      </div>
    </div>
  );
}

import { ref, get, remove } from 'firebase/database';
import { db } from '../firebase';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export const cleanupOldMessages = async (chatNodePath) => {
  try {
    const chatRef = ref(db, chatNodePath);
    const snapshot = await get(chatRef);
    
    if (!snapshot.exists()) return;

    const data = snapshot.val();
    const entries = Object.entries(data); // [[id1, msg1], [id2, msg2], ...]

    // Điều kiện 1: Tổng số tin nhắn phải > 200
    if (entries.length > 200) {
      const now = Date.now();
      
      // Duyệt qua các tin nhắn dư thừa vượt mốc 200 (các tin nhắn cũ nhất)
      const excessCount = entries.length - 200;
      
      for (let i = 0; i < excessCount; i++) {
        const [msgId, msgData] = entries[i];
        
        // Điều kiện 2: Tin nhắn đó đã quá 5 ngày
        if (msgData.timestamp && (now - msgData.timestamp > FIVE_DAYS_MS)) {
          await remove(ref(db, `${chatNodePath}/${msgId}`));
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi tự động dọn dẹp chat:", error);
  }
};
const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '10px' },
  section: { backgroundColor: '#1e293b', padding: '12px', borderRadius: '10px', border: '1px solid #334155' },
  row: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' },
  logItem: { backgroundColor: '#0f172a', padding: '6px', borderRadius: '4px', fontSize: '11px', borderLeft: '3px solid #fb8500' }
};