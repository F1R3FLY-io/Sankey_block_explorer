import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/Copernicus.png';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={logo} alt="MeTTaCycle Logo" className="logo" />
            <h1>MeTTaCycle Block Explorer</h1>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <div className="links-container" style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
              <Link
                to="/"
                className={`refresh-button ${isActive('/') ? 'active' : ''}`}
                style={{ 
                  backgroundColor: isActive('/') ? 'rgb(0, 102, 215)' : 'rgb(0, 122, 255)',
                  textDecoration: 'none'
                }}
              >
                Explorer
              </Link>
              <Link
                to="/blocks"
                className={`refresh-button ${isActive('/blocks') ? 'active' : ''}`}
                style={{ 
                  backgroundColor: isActive('/blocks') ? 'rgb(0, 102, 215)' : 'rgb(0, 122, 255)',
                  textDecoration: 'none'
                }}
              >
                Blocks
              </Link>
              <Link
                to="/demo"
                className={`refresh-button ${isActive('/demo') ? 'active' : ''}`}
                style={{ 
                  backgroundColor: isActive('/demo') ? 'rgb(0, 102, 215)' : 'rgb(0, 122, 255)',
                  textDecoration: 'none'
                }}
              >
                Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>

      <footer style={{ 
        backgroundColor: 'rgb(22, 30, 38)', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px 0',
        textAlign: 'center',
        color: 'rgb(157, 167, 177)',
        fontSize: '14px',
        marginTop: '40px'
      }}>
        © {new Date().getFullYear()} MeTTaCycle Block Explorer. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;