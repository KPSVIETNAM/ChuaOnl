import React, { useState } from 'react';
import { db } from '../firebase';
import { ref, get, set, onDisconnect } from 'firebase/database';

export default function Auth({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('nam'); // Mặc định là nam

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !password || !fullName) return alert('Vui lòng điền đủ thông tin!');

    const userRef = ref(db, `users/${cleanUser}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) return alert('Tài khoản đã tồn tại!');

    const newUser = {
      username: cleanUser,
      password: password,
      fullName: fullName,
      gender: gender,
      totalCongDuc: 0,
    };

    await set(userRef, newUser);
    alert('Đăng ký thành công! Hãy đăng nhập.');
    setAuthMode('login');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const userRef = ref(db, `users/${cleanUser}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) return alert('Tài khoản không tồn tại!');

    const userData = snapshot.val();
    if (userData.password !== password) return alert('Sai mật khẩu!');

    const onlineRef = ref(db, `online_users/${cleanUser}`);
    const initialPos = {
      fullName: userData.fullName,
      gender: userData.gender || 'nam',
      status: 'Đang tịnh tâm 🙏',
      x: Math.floor(Math.random() * 70) + 15,
      isIncensing: false
    };

    await set(onlineRef, initialPos);
    onDisconnect(onlineRef).remove();

    localStorage.setItem('kps_current_user', JSON.stringify(userData));
    // Truyền dữ liệu user lên component cha để hiển thị trang Tam Quan
    onLoginSuccess(userData);
  };
  
  return (
    <div style={styles.loginContainer}>
      <div style={styles.bgOverlay} />
      <div style={styles.loginBox}>
        <div style={styles.logoContainer}>
          <div style={styles.logoTopRow}>
            <span style={styles.lantern}>🏮</span>
            <h1 style={styles.titleChua}>CHÙA</h1>
            <span style={styles.lantern}>🏮</span>
          </div>
          <h1 style={styles.titleOnline}>ONLINE  </h1>
        </div> 

        <form onSubmit={authMode === 'login' ? handleLogin : handleLoginSubmit}>
          {authMode === 'register' && (
            <>
              <input 
                type="text" 
                placeholder="Họ và Tên (VD: Tiến R&D)" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.input}
                required
              />
              <div style={{ textAlign: 'left', marginBottom: '12px', color: '#cbd5e1', fontSize: '13px' }}>
                <label style={{ marginRight: '15px' }}>Giới tính:</label>
                <label style={{ marginRight: '10px', cursor: 'pointer' }}>
                  <input type="radio" name="gender" value="nam" checked={gender === 'nam'} onChange={() => setGender('nam')} /> Nam
                </label>
                <label style={{ marginRight: '10px', cursor: 'pointer' }}>
                  <input type="radio" name="gender" value="nu" checked={gender === 'nu'} onChange={() => setGender('nu')} /> Nữ
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" name="gender" value="khac" checked={gender === 'khac'} onChange={() => setGender('khac')} /> Chưa rõ
                </label>
              </div>
            </>
          )}
          <input 
            type="text" 
            placeholder="Tên tài khoản" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            {authMode === 'login' ? 'Vào Cổng Tam Quan' : 'Tạo Tài Khoản'}
          </button>
        </form>

        <div style={{ marginTop: '15px', fontSize: '13px', color: '#cbd5e1' }}>
          {authMode === 'login' ? (
            <span>Chưa có tài khoản? <b style={{ color: '#fb8500', cursor: 'pointer' }} onClick={() => setAuthMode('register')}>Đăng ký ngay</b></span>
          ) : (
            <span>Đã có tài khoản? <b style={{ color: '#fb8500', cursor: 'pointer' }} onClick={() => setAuthMode('login')}>Đăng nhập</b></span>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  loginContainer: { 
    position: 'relative',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    backgroundImage: "url('/images/Congtamquan.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: 'sans-serif' 
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Làm mờ tối nền để nổi bật khung đăng nhập
    zIndex: 1
  },
  loginBox: { 
    position: 'relative',
    zIndex: 2,
    backgroundColor: '#1e293b', 
    padding: '30px', 
    borderRadius: '12px', 
    textAlign: 'center', 
    width: '380px', 
    border: '1px solid #334155', 
    boxSizing: 'border-box',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
  },
  logoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' },
  logoTopRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  titleChua: { color: '#ffb703', margin: '0', fontSize: '26px', letterSpacing: '2px' },
  titleOnline: { color: '#ffb703', margin: '0', fontSize: '30px', letterSpacing: '3px', lineHeight: '1.1' },
  lantern: { fontSize: '22px' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#0f172a', color: '#fff' },
  button: { width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#b45309', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }
};