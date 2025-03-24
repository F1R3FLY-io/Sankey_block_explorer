import React from 'react';
import './App.css';
import EnergyFlowExample from '../components/energy_flow';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sankey Block Explorer</h1>
      </header>
      <main>
        <EnergyFlowExample />
      </main>
    </div>
  );
}

export default App;