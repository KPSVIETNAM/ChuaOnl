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

      <div style={{ ...styles.section, marginTop: '15px' }}>
        <h3>📜 NHẬT KÝ CHÁNH ĐIỆN</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
          {logs.map((log, index) => (
            <div key={index} style={styles.logItem}>
              <span style={{ color: '#64748b', fontSize: '10px' }}>[{log.time}]</span> {log.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '10px' },
  section: { backgroundColor: '#1e293b', padding: '12px', borderRadius: '10px', border: '1px solid #334155' },
  row: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' },
  logItem: { backgroundColor: '#0f172a', padding: '6px', borderRadius: '4px', fontSize: '11px', borderLeft: '3px solid #fb8500' }
};