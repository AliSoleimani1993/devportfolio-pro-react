// ============================================
// FILE: src/pages/Developers.js
// ============================================
// WHAT: All developer management page
// WHY: Our main app functionality

import React, { useState } from 'react';

function Developers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [developers, setDevelopers] = useState([
    {
      id: 1,
      name: "Sarah Developer",
      age: 28,
      skills: ["React", "Node.js", "MongoDB"],
      experience: 4,
      isActive: true,
      projects: ["E-commerce App", "Portfolio Website"],
      salary: 75000
    },
    // ... more developers
  ]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const addDeveloper = () => {
    const newDeveloper = {
      id: developers.length + 1,
      name: "New Developer",
      age: 25,
      skills: ["React", "JavaScript"],
      experience: 1,
      isActive: true,
      projects: ["First Project"],
      salary: 50000
    };
    setDevelopers([...developers, newDeveloper]);
  };

  const deleteDeveloper = (id) => {
    const confirmDelete = window.confirm('Are you sure?');
    if (confirmDelete) {
      setDevelopers(developers.filter(dev => dev.id !== id));
    }
  };

  const filteredDevelopers = developers.filter(dev =>
    dev.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <h1>👨‍💻 Developer Directory</h1>
      
      {/* Search and Add */}
      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Search developers..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={addDeveloper}>➕ Add Developer</button>
      </div>

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-box">
          <span className="stat-number">{developers.length}</span>
          <span className="stat-label">Total Developers</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">
            {developers.filter(d => d.isActive).length}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">
            {(developers.reduce((sum, d) => sum + d.experience, 0) / developers.length).toFixed(1)}
          </span>
          <span className="stat-label">Avg Experience</span>
        </div>
      </div>

      {/* Developer Cards */}
      <div className="developers-grid">
        {filteredDevelopers.map(dev => (
          <div key={dev.id} className="developer-card">
            <button 
              className="delete-btn" 
              onClick={() => deleteDeveloper(dev.id)}
            >
              🗑️
            </button>
            <h3>{dev.name}</h3>
            <div>💼 {dev.experience} years experience</div>
            <div>👤 {dev.age} years old</div>
            <div className="skills-container">
              {dev.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>
            <span className={`badge ${dev.isActive ? 'active' : 'inactive'}`}>
              {dev.isActive ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Developers;