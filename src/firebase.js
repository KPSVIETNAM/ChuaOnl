import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD2Ikho89xzQiHSaZu72ERVp1tg8vCsrfA",
  authDomain: "dichuaonl-38ea5.firebaseapp.com",
  projectId: "dichuaonl-38ea5",
  storageBucket: "dichuaonl-38ea5.firebasestorage.app",
  messagingSenderId: "909064051937",
  appId: "1:909064051937:web:1fbd2ff0a8c8ba26b6aba0",
  measurementId: "G-CD5V251TE3"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Dòng này bắt buộc phải có từ 'export' ở đầu để App.jsx import được!
export const db = getDatabase(app);