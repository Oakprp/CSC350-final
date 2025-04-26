'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import '../styles.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    if (!trimmedUsername || !trimmedPassword) {
      setError('Username and password are required');
      console.error('Empty username or password');
      return;
    }
    try {
      console.log('Attempting login with username:', trimmedUsername);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
      });
      console.log('Login response status:', res.status);
      const data = await res.json();
      console.log('Login response data:', data);
      if (res.ok) {
        console.log('Login successful, redirecting to /admin/dashboard');
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
        console.error('Login failed:', data.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    }
  };

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
