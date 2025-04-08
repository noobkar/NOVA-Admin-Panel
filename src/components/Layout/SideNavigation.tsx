import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './SideNavigation.scss';

const SideNavigation: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`side-navigation ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="side-nav-header">
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-bolt"></i>
          </div>
          {!isCollapsed && <h1>Nova<span>Admin</span></h1>}
        </div>
        <button 
          className="collapse-toggle" 
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <i className={`fas fa-angle-${isCollapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      <div className="user-profile">
        <div className="avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <h4>Admin User</h4>
            <p>Super Admin</p>
          </div>
        )}
      </div>

      <div className="side-nav-menu">
        <ul>
          <li className={isActive('/') ? 'active' : ''}>
            <Link href="/">
              <i className="fas fa-tachometer-alt"></i>
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={isActive('/users') ? 'active' : ''}>
            <Link href="/users">
              <i className="fas fa-users"></i>
              {!isCollapsed && <span>Users</span>}
            </Link>
          </li>
          <li className={isActive('/servers') ? 'active' : ''}>
            <Link href="/servers">
              <i className="fas fa-server"></i>
              {!isCollapsed && <span>Servers</span>}
            </Link>
          </li>
          <li className={isActive('/server-requests') ? 'active' : ''}>
            <Link href="/server-requests">
              <i className="fas fa-tasks"></i>
              {!isCollapsed && <span>Server Requests</span>}
            </Link>
          </li>
          <li className={isActive('/affiliates') ? 'active' : ''}>
            <Link href="/affiliates">
              <i className="fas fa-handshake"></i>
              {!isCollapsed && <span>Affiliates</span>}
            </Link>
          </li>
          <li className={isActive('/commissions') ? 'active' : ''}>
            <Link href="/commissions">
              <i className="fas fa-percentage"></i>
              {!isCollapsed && <span>Commissions</span>}
            </Link>
          </li>
          <li className={isActive('/withdrawals') ? 'active' : ''}>
            <Link href="/withdrawals">
              <i className="fas fa-money-bill-wave"></i>
              {!isCollapsed && <span>Withdrawals</span>}
            </Link>
          </li>
          <li className={isActive('/settings') ? 'active' : ''}>
            <Link href="/settings">
              <i className="fas fa-cog"></i>
              {!isCollapsed && <span>General</span>}
            </Link>
          </li>
          <li className={isActive('/admin-roles') ? 'active' : ''}>
            <Link href="/admin-roles">
              <i className="fas fa-user-shield"></i>
              {!isCollapsed && <span>Admin Roles</span>}
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="side-nav-footer">
        <button className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default SideNavigation;