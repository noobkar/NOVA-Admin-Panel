import React, { useState, useEffect } from 'react';
import Header from './Header';
import SideNavigation from './SideNavigation';
import ThemeSwitcher from './ThemeSwitcher';
import LayoutController from './LayoutController';
import PageHeader from './PageHeader';
import './DashboardLayout.scss';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs: BreadcrumbItem[];
  showBackButton?: boolean;
  onBackButtonClick?: () => void;
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  breadcrumbs = [],
  showBackButton = false,
  onBackButtonClick,
  actions
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSideNav, setIsSideNav] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  
  // Toggle theme between light and dark
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Toggle between side navigation and top navigation
  const toggleLayout = () => {
    setIsSideNav(!isSideNav);
    // Save preference to localStorage
    localStorage.setItem('navPreference', (!isSideNav).toString());
  };
  
  // Toggle side navigation collapse
  const toggleCollapse = () => {
    setNavCollapsed(!navCollapsed);
    // Save preference to localStorage
    localStorage.setItem('navCollapsed', (!navCollapsed).toString());
  };

  // Apply theme class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);
  
  // Load saved preferences
  useEffect(() => {
    const savedNavPreference = localStorage.getItem('navPreference');
    const savedNavCollapsed = localStorage.getItem('navCollapsed');
    
    if (savedNavPreference) {
      setIsSideNav(savedNavPreference === 'true');
    }
    
    if (savedNavCollapsed) {
      setNavCollapsed(savedNavCollapsed === 'true');
    }
  }, []);
  
  // Apply layout class to body
  useEffect(() => {
    if (isSideNav) {
      document.body.classList.add('side-nav-layout');
    } else {
      document.body.classList.remove('side-nav-layout');
    }
  }, [isSideNav]);

  return (
    <div className={`dashboard-layout ${isSideNav ? 'with-side-nav' : ''} ${navCollapsed ? 'nav-collapsed' : ''}`}>
      {isSideNav ? (
        <SideNavigation collapsed={navCollapsed} toggleCollapse={toggleCollapse} />
      ) : (
        <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      )}
      
      <div className="content-wrapper">
        <PageHeader title={title} breadcrumbs={breadcrumbs} />
        <main className="main-content">
          <div className="container">
            {children}
          </div>
        </main>
      </div>
      
      <ThemeSwitcher toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <LayoutController toggleLayout={toggleLayout} isSideNav={isSideNav} />
    </div>
  );
};

export default DashboardLayout;