import React from 'react';
import './ThemeSwitcher.scss';

interface ThemeSwitcherProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ toggleTheme, isDarkMode }) => {
  return (
    <div className="theme-switcher">
      <button 
        className={`theme-btn ${isDarkMode ? 'active' : ''}`} 
        onClick={toggleTheme}
        title="Dark mode"
      >
        <i className="fas fa-moon"></i>
      </button>
      <button 
        className={`theme-btn ${!isDarkMode ? 'active' : ''}`} 
        onClick={toggleTheme}
        title="Light mode"
      >
        <i className="fas fa-sun"></i>
      </button>
    </div>
  );
};

export default ThemeSwitcher; 