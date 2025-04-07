import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Import the logo image
import logo from '../assets/Copernicus.png';

interface MainLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onRefresh, loading = false }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <img src={logo} alt="MeTTaCycle Logo" className="logo" />
          <h1>MeTTaCycle Block Explorer</h1>
        </div>
        <div className="header-right">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>
          {onRefresh && (
            <button 
              className="refresh-button" 
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh data'}
            </button>
          )}
        </div>
      </header>

      <nav className="app-nav">
        <ul>
          <li>
            <Link 
              to="/" 
              style={isActive('/') ? { backgroundColor: '#0066d7' } : {}}
            >
              Explorer
            </Link>
          </li>
          <li>
            <Link 
              to="/blocks" 
              style={isActive('/blocks') ? { backgroundColor: '#0066d7' } : {}}
            >
              Blocks
            </Link>
          </li>
          <li>
            <Link 
              to="/demo" 
              style={isActive('/demo') ? { backgroundColor: '#0066d7' } : {}}
            >
              Demo
            </Link>
          </li>
        </ul>
      </nav>

      <main className="app-main">
        {children}
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} MeTTaCycle Block Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;