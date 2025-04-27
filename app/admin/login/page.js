'use client';

import React, { useState } from 'react'; 
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi'; 
import '../styles.css'; 

// สำหรับยืนยันตัวตนของผู้ดูแลระบบ
export default function AdminLogin() {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); // แสดง/ซ่อนรหัสผ่าน
  const [error, setError] = useState(''); 

  // ไปหน้า dashboard หลัง login สำเร็จ
  const router = useRouter();

  // สำหรับจัดการการส่งฟอร์ม login
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 

    // ลบช่องว่างส่วนเกินจาก username และ password
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // ตรวจสอบว่า username และ password ไม่ว่างเปล่า
    if (!trimmedUsername || !trimmedPassword) {
      setError('Username and password are required'); 
      console.error('Empty username or password'); 
      return;
    }

    try {
      console.log('Attempting login with username:', trimmedUsername); 
      // ส่ง POST request ไปยัง API endpoint `/api/admin/login` เพื่อยืนยันตัวตน
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // กำหนดประเภทข้อมูลเป็น JSON
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }), // ส่งข้อมูล username และ password
      });

      console.log('Login response status:', res.status); 
      const data = await res.json(); // แปลง response เป็น JSON
      console.log('Login response data:', data); 

      if (res.ok) { 
        console.log('Login successful, redirecting to /admin/dashboard'); // Login สำเร็จ
        router.push('/admin/dashboard'); // เปลี่ยนหน้าไปยังหน้า dashboard ของ admin
      } else {
        setError(data.error || 'Login failed'); 
        console.error('Login failed:', data.error); 
      }
    } catch (err) {
      console.error('Login error:', err); 
      setError('An error occurred during login'); 
    }
  };

  // สำหรับแสดงหน้า login
  return (
    <div className="login-page">
      <header className="login-header">
        <Link href="/attractions" className="back-button">
          <FiArrowLeft size={20} />
          <span>กลับไปยังหน้าเดิม</span>
        </Link>
      </header>
      <div className="login-container">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'} 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
              {/* ปุ่มสำหรับแสดง/ซ่อนรหัสผ่าน */}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />} 
              </button>
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="submit-button">Login</button>
        </form>
      </div>
    </div>
  );
}