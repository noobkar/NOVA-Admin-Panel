'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/auth.service';
import './login.scss';

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: '',
    browserInfo: '',
    osInfo: ''
  });

  // Check if user is already logged in and redirect if they are
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('[Login Page] Auth check - token exists:', !!token);
      
      // Only redirect if actually authenticated
      if (token) {
        console.log('[Login Page] User authenticated, redirecting to dashboard');
        window.location.href = '/';
      } else {
        console.log('[Login Page] User not authenticated, staying on login page');
      }
    }
  }, []);

  // Move device info collection to useEffect to ensure it only runs client-side
  useEffect(() => {
    // Generate a device ID
    const deviceId = `web-admin-${Math.random().toString(36).substring(2, 15)}`;
    
    // Get browser and OS info
    const userAgent = window.navigator.userAgent;
    const browserInfo = userAgent;
    const osInfo = window.navigator.platform;

    setDeviceInfo({
      deviceId,
      browserInfo,
      osInfo
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', {
        email: formData.email,
        device_id: deviceInfo.deviceId
      });
      
      const response = await AuthService.login({
        email: formData.email,
        password: formData.password,
        device_id: deviceInfo.deviceId,
        device_type: 'web-admin',
        device_details: {
          browser: deviceInfo.browserInfo,
          os: deviceInfo.osInfo,
        },
      });

      console.log('Login successful, response:', response.data);
      
      // Store auth data in localStorage only
      AuthService.setAuthData(response.data);
      
      console.log('Auth data stored, redirecting to dashboard...');
      
      // Use window location for a full page redirect
      window.location.href = '/';
    } catch (err: any) {
      console.error('Login error details:', err);
      setError(
        err.response?.data?.message || 
        'Failed to login. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h1>Nova<span>Admin</span></h1>
            </div>
            <p>Admin Panel Login</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="form-control">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-control">
              <div className="password-label">
                <label className="form-label" htmlFor="password">Password</label>
                <a href="#" className="forgot-link">Forgot Password?</a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading || !deviceInfo.deviceId}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 