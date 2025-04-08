import React, { useState } from 'react';
import Link from 'next/link';
import './Header.scss';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <h1>Nova <span>Admin</span></h1>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li className="active">
              <Link href="/">Dashboard</Link>
            </li>
            <li>
              <Link href="/users">Users</Link>
            </li>
            <li>
              <Link href="/servers">Servers</Link>
            </li>
            <li>
              <Link href="/affiliates">Affiliates</Link>
            </li>
            <li>
              <Link href="/settings">Settings</Link>
            </li>
          </ul>
        </nav>
        
        <div className="header-actions">
          <div className="search-wrapper">
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
            <div className="search-input">
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          
          <div className="notifications">
            <button className="notif-btn">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </button>
          </div>
          
          <div className="user-dropdown-container">
            <button className={`user-btn ${userDropdownOpen ? 'active' : ''}`} onClick={toggleUserDropdown}>
              <div className="user-avatar">
                <img src="/assets/avatar.png" alt="User" onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=Admin&background=7367f0&color=fff';
                }} />
              </div>
              <span>Admin</span>
              <i className="fas fa-chevron-down"></i>
            </button>
            
            {userDropdownOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      <img src="/assets/avatar.png" alt="User" onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://ui-avatars.com/api/?name=Admin&background=7367f0&color=fff';
                      }} />
                    </div>
                    <div>
                      <h4>Admin User</h4>
                      <p>Administrator</p>
                    </div>
                  </div>
                </div>
                <ul className="user-dropdown-menu">
                  <li>
                    <Link href="/profile">
                      <i className="fas fa-user"></i>
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings">
                      <i className="fas fa-cog"></i>
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button className="theme-toggle" onClick={toggleTheme}>
                      <i className={isDarkMode ? "fas fa-sun" : "fas fa-moon"}></i>
                      {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                  </li>
                  <li>
                    <button className="logout-btn">
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;