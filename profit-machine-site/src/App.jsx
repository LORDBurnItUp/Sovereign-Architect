import React, { useState, useEffect } from 'react';
import './App.css';

const LandingPage = ({ onCommand }) => (
  <div className="landing-container">
    <nav className="top-nav glass-panel">
      <div className="logo amber-glow">SOVEREIGN_MACHINE</div>
      <div className="nav-links">
        <span>STRATEGIC_INTEL</span>
        <span>GLOBAL_ACCESS</span>
        <button className="ghost" onClick={onCommand}>ACCESS_TERMINAL</button>
      </div>
    </nav>

    <main className="hero-section">
      <div className="hero-content">
        <h1 className="display-lg">COMMAND<br/>YOUR_EMPIRE</h1>
        <p className="hero-subtext">
          High-velocity strategic instrument for the billionaire-class digital commander.<br/> 
          Deploy capital with autonomous precision.
        </p>
        <div className="cta-group">
          <button className="primary" onClick={onCommand}>AUTHORIZE_CORE</button>
          <button className="ghost">VIEW_SYSTEM_LOGS</button>
        </div>
      </div>
      
      <div className="intelligence-viz">
        <div className="core-orb intelligence-core">
          <div className="inner-pulse"></div>
        </div>
      </div>
    </main>

    <section className="intel-grid">
      <div className="intel-card glass-panel">
        <h3 className="cyan-glow">Neural Yield Optimizer</h3>
        <p>Autonomous arbitrage protocols executing at 14ms latency.</p>
        <div className="data-readout">STATUS: OPTIMAL</div>
      </div>
      <div className="intel-card glass-panel">
        <h3 className="cyan-glow">Syndicate Flow</h3>
        <p>Multi-sig validation across 14 sovereign clusters ensuring absolute capital security.</p>
        <div className="data-readout">FLOW: 1.4B/SEC</div>
      </div>
      <div className="intel-card glass-panel">
        <h3 className="cyan-glow">Quantum Threat Shield</h3>
        <p>Encrypted state-actor level security protocols protecting all revenue stream identities.</p>
        <div className="data-readout">SHIELD: ACTIVE</div>
      </div>
    </section>

    <footer className="footer-ticker glass-panel">
      <div className="ticker-label">REVENUE_VELOCITY:</div>
      <div className="ticker-track">
        <span>BTC +1.4% // USD +$12,401.92 // CORE_LOAD 12% // KDS_VALUATION $10.4B // </span>
        <span>BTC +1.4% // USD +$12,401.92 // CORE_LOAD 12% // KDS_VALUATION $10.4B // </span>
      </div>
    </footer>
  </div>
);

const CommandDashboard = () => (
  <div className="dashboard-container">
    <aside className="sidebar glass-panel">
      <div className="sidebar-header amber-glow">COMMAND_CENTRE</div>
      <nav className="sidebar-nav">
        <div className="nav-item active">INTELLIGENCE_CORE</div>
        <div className="nav-item">LEAD_HUNT</div>
        <div className="nav-item">FINANCIAL_VELOCITY</div>
        <div className="nav-item">SECURITY_PROTOCOLS</div>
      </nav>
      <div className="system-status">
        <div className="status-dot green"></div>
        SYSTEM: ONLINE
      </div>
    </aside>

    <main className="dashboard-main">
      <header className="dash-header">
        <div className="breadcrumb">ROOT / INTELLIGENCE_CORE</div>
        <div className="user-profile">OPERATOR_01</div>
      </header>

      <section className="dash-grid">
        <div className="main-viz glass-panel">
          <h2 className="amber-glow">Strategic Intelligence Core</h2>
          <div className="viz-placeholder">
            {/* Visual simulation of moving data particles */}
            <div className="particle-core">
              <div className="p1"></div>
              <div className="p2"></div>
              <div className="p3"></div>
            </div>
            <div className="central-metric">
              <span className="metric-label">ROI_PROJECTION</span>
              <span className="metric-value">+42.8%</span>
            </div>
          </div>
        </div>

        <div className="secondary-viz glass-panel">
          <h3 className="cyan-glow">Global Lead Hunt</h3>
          <div className="map-placeholder">
             {/* Styled world map logic */}
             <div className="map-node node1"></div>
             <div className="map-node node2"></div>
             <div className="map-node node3"></div>
          </div>
        </div>

        <div className="revenue-pulse glass-panel">
          <h3 className="amber-glow">Revenue Pulse</h3>
          <div className="chart-placeholder">
            <svg viewBox="0 0 400 100" className="pulse-svg">
              <polyline 
                fill="none" stroke="#FFB000" strokeWidth="2"
                points="0,80 40,75 80,90 120,40 160,60 200,20 240,45 280,30 320,50 360,10 400,30"
              />
            </svg>
          </div>
        </div>
      </section>

      <section className="data-stream glass-panel">
        <div className="stream-header">ACTIVE_INTELLIGENCE_FEED</div>
        <div className="stream-item">[14:02:11] Lead extracted in Tokyo cluster. Value: $120k</div>
        <div className="stream-item">[14:02:45] Arbitrage opportunity detected in London. Executing...</div>
        <div className="stream-item">[14:03:02] Revenue stream secured. Encryption level: AES-512</div>
      </section>
    </main>
  </div>
);

function App() {
  const [view, setView] = useState('landing');

  return (
    <div className="app-root">
      <div className="grid-overlay"></div>
      {view === 'landing' ? (
        <LandingPage onCommand={() => setView('dashboard')} />
      ) : (
        <CommandDashboard />
      )}
    </div>
  );
}

export default App;
