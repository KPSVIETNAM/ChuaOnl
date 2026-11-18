import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';

export default function QuanLyChua({ allUsers = {} }) {
  const [roleDrafts, setRoleDrafts] = useState({});
  const [savingUsername, setSavingUsername] = useState(null);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  const users = Object.entries(allUsers)
    .map(([username, user]) => ({ ...user, username }))
    .filter((user) => {
      const query = search.trim().toLowerCase();
      return !query || user.username.toLowerCase().includes(query) ||
        (user.fullName || '').toLowerCase().includes(query);
    })
    .sort((a, b) => (Number(b.chiSoDongGop) || 0) - (Number(a.chiSoDongGop) || 0));

  const saveRole = async (username) => {
    const chucVu = (roleDrafts[username] ?? allUsers[username]?.chucVu ?? '').trim();
    setSavingUsername(username);
    setNotice('');
    try {
      await update(ref(db, `users/${username}`), { chucVu: chucVu || null });
      setRoleDrafts((drafts) => {
        const nextDrafts = { ...drafts };
        delete nextDrafts[username];
        return nextDrafts;
      });
      setNotice(`Đã cập nhật chức vụ cho ${allUsers[username]?.fullName || username}.`);
    } catch (error) {
      console.error('Lỗi cập nhật chức vụ:', error);
      setNotice('Không thể cập nhật chức vụ. Vui lòng thử lại.');
    } finally {
      setSavingUsername(null);
    }
  };

  return (
    <main style={styles.container}>
      <header style={styles.heading}>
        <div>
          <h1 style={styles.title}>🏯 Quản lý chùa</h1>
          <p style={styles.subtitle}>Quản lý chức vụ và theo dõi chỉ số đóng góp của các thành viên.</p>
        </div>
        <input
          aria-label="Tìm thành viên"
          placeholder="Tìm theo tên hoặc tài khoản..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={styles.search}
        />
      </header>

      {notice && <p role="status" style={styles.notice}>{notice}</p>}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cell}>Thành viên</th>
              <th style={styles.cell}>Chức vụ</th>
              <th style={styles.cell}>Chỉ số đóng góp</th>
              <th style={styles.cell}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.username}>
                <td style={styles.cell}>
                  <strong>{user.fullName || user.username}</strong>
                  <div style={styles.username}>@{user.username}</div>
                </td>
                <td style={styles.cell}>
                  <input
                    aria-label={`Chức vụ của ${user.fullName || user.username}`}
                    placeholder="Chưa có chức vụ"
                    value={roleDrafts[user.username] ?? user.chucVu ?? ''}
                    onChange={(event) => setRoleDrafts((drafts) => ({
                      ...drafts,
                      [user.username]: event.target.value
                    }))}
                    style={styles.roleInput}
                  />
                </td>
                <td style={styles.score}>{(Number(user.chiSoDongGop) || 0).toFixed(2)}</td>
                <td style={styles.cell}>
                  <button
                    type="button"
                    disabled={savingUsername === user.username}
                    onClick={() => saveRole(user.username)}
                    style={styles.saveButton}
                  >
                    {savingUsername === user.username ? 'Đang lưu...' : 'Lưu chức vụ'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="4" style={styles.empty}>Không tìm thấy thành viên.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={styles.legend}>Điểm: mỗi phút tịnh tâm +1 · mỗi lần thỉnh chuông +0,1 · mỗi lần gõ mõ +0,01</p>
    </main>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '22px',
    boxSizing: 'border-box',
    color: '#f4ead8',
    background: '#171d2b',
    border: '1px solid #34394a',
    borderRadius: '14px',
    minHeight: '80vh'
  },
  heading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
    marginBottom: '18px'
  },
  title: { color: '#ffb703', margin: 0, fontSize: '24px' },
  subtitle: { color: '#cbd5e1', margin: '7px 0 0', fontSize: '13px' },
  search: {
    minWidth: '240px',
    padding: '10px 12px',
    border: '1px solid #475569',
    borderRadius: '7px',
    background: '#0f172a',
    color: '#fff',
    boxSizing: 'border-box'
  },
  notice: { color: '#a7f3d0', fontSize: '13px' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  cell: { padding: '12px 10px', borderBottom: '1px solid #334155', verticalAlign: 'middle' },
  username: { color: '#94a3b8', fontSize: '12px', marginTop: '3px' },
  roleInput: {
    width: '100%',
    minWidth: '150px',
    padding: '8px',
    border: '1px solid #475569',
    borderRadius: '6px',
    background: '#0f172a',
    color: '#fff',
    boxSizing: 'border-box'
  },
  score: { padding: '12px 10px', borderBottom: '1px solid #334155', color: '#f7dfad', fontWeight: 'bold' },
  saveButton: {
    padding: '8px 11px',
    background: '#b45309',
    color: '#fff',
    border: 0,
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  empty: { padding: '24px', textAlign: 'center', color: '#94a3b8' },
  legend: { color: '#cbd5e1', fontSize: '12px', marginTop: '18px' }
};
