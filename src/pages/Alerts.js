// ============================================
// FILE: src/pages/Alerts.js
// ============================================
// WHAT: Displays network alerts from MongoDB
// WHY: Shows system warnings, errors, and info
// WHERE: FRONTEND component (React page)

import React, { useState, useEffect } from 'react';
import { getAlerts, acknowledgeAlert } from '../services/api';
import { getCurrentUser } from '../services/api';

function Alerts() {
  // ============================================
  // STATE
  // ============================================
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // ============================================
  // LOAD ALERTS
  // ============================================
  const loadAlerts = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      const alertsData = await getAlerts();
      setAlerts(alertsData);
      setError(null);
    } catch (err) {
      setError('Failed to load alerts');
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ACKNOWLEDGE ALERT
  // ============================================
  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id);
      // Update the alert in the list
      setAlerts(alerts.map(alert => 
        alert._id === id ? { ...alert, acknowledged: true } : alert
      ));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      alert('Failed to acknowledge alert');
    }
  };

  // ============================================
  // LOAD DATA ON MOUNT
  // ============================================
  useEffect(() => {
    loadAlerts();
  }, []);

  // ============================================
  // GET ALERT ICON
  // ============================================
  const getAlertIcon = (type) => {
    switch(type) {
      case 'error': return '🔴';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  // ============================================
  // GET ALERT STYLE
  // ============================================
  const getAlertStyle = (type) => {
    switch(type) {
      case 'error': return { background: '#ffebee', borderColor: '#f44336', color: '#c62828' };
      case 'warning': return { background: '#fff3e0', borderColor: '#ff9800', color: '#e65100' };
      case 'success': return { background: '#e8f5e9', borderColor: '#4CAF50', color: '#2e7d32' };
      case 'info': return { background: '#e3f2fd', borderColor: '#2196F3', color: '#0d47a1' };
      default: return { background: '#f5f5f5', borderColor: '#9e9e9e', color: '#424242' };
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={loadAlerts}>Retry</button>
        </div>
      </div>
    );
  }

  // Count unacknowledged alerts
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="page-container">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🔔 Alerts Dashboard</h1>
        {unacknowledgedCount > 0 && (
          <span style={{ 
            background: '#f44336', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '20px',
            fontWeight: 'bold'
          }}>
            {unacknowledgedCount} unacknowledged
          </span>
        )}
      </div>

      {user && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Welcome, {user.name}! 👋
        </p>
      )}

      {/* ALERTS LIST */}
      {alerts.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No alerts found. System is running smoothly! 🎉
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map(alert => (
            <div 
              key={alert._id}
              style={{
                ...getAlertStyle(alert.type),
                borderLeft: `6px solid ${getAlertStyle(alert.type).borderColor}`,
                padding: '16px 20px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: alert.acknowledged ? 0.7 : 1,
                transition: 'opacity 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <span style={{ fontSize: '24px' }}>{getAlertIcon(alert.type)}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {alert.message}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {new Date(alert.timestamp).toLocaleString()}
                    {alert.deviceId && ` • Device: ${alert.deviceId}`}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  background: alert.acknowledged ? '#e0e0e0' : '#ff9800',
                  color: alert.acknowledged ? '#666' : 'white',
                  fontWeight: 'bold'
                }}>
                  {alert.acknowledged ? '✓ Acknowledged' : '⚠️ New'}
                </span>
                
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert._id)}
                    style={{
                      padding: '6px 16px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REFRESH BUTTON */}
      <button 
        onClick={loadAlerts}
        style={{
          marginTop: '20px',
          padding: '10px 25px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        🔄 Refresh Alerts
      </button>
    </div>
  );
}

export default Alerts;