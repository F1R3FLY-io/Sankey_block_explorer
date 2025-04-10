import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// Import the logo image
import logo from '../assets/Copernicus.png';
import { BlockWithDeploys } from '../services/blockService';

interface BlockCategories {
  sources: BlockWithDeploys[];
  sinks: BlockWithDeploys[];
  sourceSinks: BlockWithDeploys[];
}

interface MainLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  loading?: boolean;
  blocks?: BlockWithDeploys[];
  categories?: BlockCategories;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onRefresh, loading = false, blocks, categories }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // TODO: Current state management using React's useState is sufficient for demo purposes.
  // For production, consider implementing a state manager (Redux/MobX/Zustand) to handle:
  // - Complex state updates
  // - Data persistence
  // - State synchronization between components
  const [searchQuery, setSearchQuery] = useState('');
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleNavigation = (path: string) => {
    navigate(path, {
      state: {
        blocks,
        categories,
        currentBlockIndex: location.state?.currentBlockIndex || 0
      }
    });
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
            <button 
              onClick={() => handleNavigation('/')}
              className={`border-none text-white py-3 px-5 cursor-pointer rounded-t ${isActive('/') ? 'bg-blue-600' : 'bg-transparent hover:bg-blue-700/50'}`}
            >
              Explorer
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavigation('/blocks')}
              className={`border-none text-white py-3 px-5 cursor-pointer rounded-t ${isActive('/blocks') ? 'bg-blue-600' : 'bg-transparent hover:bg-blue-700/50'}`}
            >
              Blocks
            </button>
          </li>
          <li>
            <Link 
              to="/demo" 
              className={`py-3 px-5 rounded-t ${isActive('/demo') ? 'bg-blue-600' : 'bg-transparent hover:bg-blue-700/50'}`}
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