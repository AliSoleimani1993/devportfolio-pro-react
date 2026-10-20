// ============================================
// FILE: src/pages/About.js
// ============================================
// WHAT: About page showing developer info

import React from 'react';

function About() {
  return (
    <div className="page-container">
      <h1>📖 About DevPortfolio Pro</h1>
      
      <div className="about-content">
        <section>
          <h2>Our Mission</h2>
          <p>To connect developers worldwide and provide tools for IT professionals.</p>
        </section>

        <section>
          <h2>Technologies Used</h2>
          <div className="tech-stack">
            <span className="tech-tag">React.js</span>
            <span className="tech-tag">Node.js</span>
            <span className="tech-tag">Express</span>
            <span className="tech-tag">MongoDB</span>
            <span className="tech-tag">Cisco</span>
            <span className="tech-tag">Flutter</span>
          </div>
        </section>

        <section>
          <h2>Network Tools</h2>
          <ul>
            <li>Network Monitoring</li>
            <li>Device Discovery</li>
            <li>Diagnostic Tools</li>
            <li>Performance Analysis</li>
          </ul>
        </section>

        <section>
          <h2>Learning Journey</h2>
          <div className="learning-progress">
            <div className="progress-item">
              <span>Full Stack Development</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '60%' }}>60%</div>
              </div>
            </div>
            <div className="progress-item">
              <span>Networking & Cisco</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '30%' }}>30%</div>
              </div>
            </div>
            <div className="progress-item">
              <span>Mobile Development</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '10%' }}>10%</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;