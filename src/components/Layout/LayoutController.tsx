import React, { useState, useEffect } from 'react';
import './LayoutController.scss';

interface LayoutControllerProps {
  toggleLayout: () => void;
  isSideNav: boolean;
}

const LayoutController: React.FC<LayoutControllerProps> = ({ toggleLayout, isSideNav }) => {
  return (
    <div className="layout-controller">
      <div className="layout-options">
        <button 
          className={`layout-option ${isSideNav ? 'active' : ''}`} 
          onClick={toggleLayout}
          title="Side Navigation"
        >
          <div className="layout-icon">
            <div className="side-nav-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="content-icon"></div>
          </div>
          <span>Side Navigation</span>
        </button>
        <button 
          className={`layout-option ${!isSideNav ? 'active' : ''}`} 
          onClick={toggleLayout}
          title="Top Navigation"
        >
          <div className="layout-icon">
            <div className="top-nav-icon"></div>
            <div className="content-icon"></div>
          </div>
          <span>Top Navigation</span>
        </button>
      </div>
    </div>
  );
};

export default LayoutController;