// ============================================
// FILE: src/App.js
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Alerts from './pages/Alerts';
import Tickets from './pages/Tickets';

// Import pages
import Home from './pages/Home';
import Developers from './pages/Developers';
import UploadTest from './pages/UploadTest';
import NetworkDashboard from './pages/NetworkDashboard';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="nav-brand">🚀 DevPortfolio Pro</div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/developers">Developers</Link>
            <Link to="/network">Network Dashboard</Link>
            <Link to="/about">About</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/alerts">Alerts</Link>
            <Link to="/tickets">Tickets</Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload-test" element={<UploadTest />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/network" element={<NetworkDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/tickets" element={<Tickets />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;