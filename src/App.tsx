import React, { useState } from 'react';
import './App.css';
import BlockchainFlowExample from '../components/energy_flow';
import { siteConfig, mainNavigation } from './siteMetdata';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <div className="logo-container">
            <img src={siteConfig.logo} alt="DUNA Logo" className="logo" />
          </div>
          
          <button 
            className="mobile-menu-button" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="menu-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
          
          <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul>
              {mainNavigation.map((item) => (
                <li key={item.name}>
                  <a href={item.path}>
                    {item.icon && <span className="nav-icon">{item.icon}</span>}
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <h1>Blockchain Value Flow Explorer</h1>
      </header>
      <main>
        <BlockchainFlowExample />
      </main>
    </div>
  );
}

export default App;