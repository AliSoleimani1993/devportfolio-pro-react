// ============================================
// FILE: src/pages/Home.js
// ============================================
// WHAT: Home page component

import React from 'react';

function Home() {
  return (
    <div className="page-container">
      <h1>Welcome to DevPortfolio Pro! 🚀</h1>
      <p>Your gateway to connecting with amazing developers</p>
      
      <div className="features-grid">
        <div className="feature-card">
          <h3>👨‍💻 Developer Directory</h3>
          <p>Browse and connect with developers worldwide</p>
        </div>
        <div className="feature-card">
          <h3>🌐 Network Tools</h3>
          <p>Monitor and troubleshoot network connections</p>
        </div>
        <div className="feature-card">
          <h3>📊 Analytics</h3>
          <p>Track developer activity and trends</p>
        </div>
      </div>
    </div>
  );
}

export default Home;