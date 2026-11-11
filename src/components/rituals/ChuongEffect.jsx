import React, { useEffect, useState } from 'react';
import { db } from '../../firebase'; // điều chỉnh đường dẫn phù hợp
import { ref, onValue } from '../../firebase/database';

export function ChuongEffect() {
  const [isActive, setIsActive] = useState(false);
  const [showImg, setShowImg] = useState(false);

  useEffect(() => {
    const chuongEffectRef = ref(db, 'global_state/chuongEffect');
    const unsubscribe = onValue(chuongEffectRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.active) {
        setIsActive(true);
        setTimeout(() => setShowImg(true), 50);
      } else {
        setShowImg(false);
        // Chờ hiệu ứng opacity 1.5s mờ hết rồi mới gỡ DOM
        setTimeout(() => setIsActive(false), 1500); 
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.7)',
        zIndex: 5,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: showImg ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out',
      }}
    >
      {/* 3 vòng gợn sóng */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            border: '2px solid rgba(232, 189, 112, 0.7)',
            borderRadius: '50%',
            animation: 'chuongRipple 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite',
            animationDelay: `${i}s`,
            opacity: 0,
          }}
        />
      ))}

      {/* Hình ảnh chiếc chuông */}
      <img
        src="/images/thinhchuong.png"
        alt="Chuông"
        style={{
          width: '130px',
          height: '130px',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 2,
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.8))',
          transform: showImg ? 'scale(1)' : 'scale(0.6)',
          transition: 'transform 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      />

      <style>{`
        @keyframes chuongRipple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}