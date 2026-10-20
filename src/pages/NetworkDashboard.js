// ============================================
// FILE: src/pages/NetworkDashboard.js
// ============================================
// WHAT: Displays network devices with real data from MongoDB
// WHY: Shows all devices, allows adding and deleting
// WHERE: FRONTEND component (React page)

// ============================================
// 1. IMPORTS
// ============================================

// 📌 WHAT: Imports React and useState hook
// 📌 WHY: useState allows us to store and update data in the component
// 📌 WHERE: FRONTEND (React)
import React, { useState } from 'react';

// 📌 WHAT: Imports API functions from our service
// 📌 WHY: These functions communicate with the backend
// 📌 WHERE: FRONTEND API layer
import { getDevices, addDevice, deleteDevice, getCurrentUser } from '../services/api';

// ============================================
// 2. MAIN COMPONENT
// ============================================

// 📌 WHAT: NetworkDashboard component
// 📌 WHY: Displays the network dashboard page
// 📌 WHERE: FRONTEND React component
function NetworkDashboard() {
  // ============================================
  // 3. STATE (Data that can change)
  // ============================================

  // 📌 WHAT: State for devices list
  // 📌 WHY: Stores all devices fetched from the database
  // 📌 HOW: devices = current data, setDevices = function to update it
  // 📌 WHERE: FRONTEND component state
  const [devices, setDevices] = useState([]);

  // 📌 WHAT: State for loading status
  // 📌 WHY: Shows a loading spinner while data is being fetched
  // 📌 WHERE: FRONTEND component state
  const [loading, setLoading] = useState(true);

  // 📌 WHAT: State for error messages
  // 📌 WHY: Displays errors if something goes wrong
  // 📌 WHERE: FRONTEND component state
  const [error, setError] = useState(null);

  // 📌 WHAT: State for current user
  // 📌 WHY: Shows who is logged in
  // 📌 WHERE: FRONTEND component state
  const [user, setUser] = useState(null);



  const [searchTerm, setsearchTerm] = useState('');

  // ============================================
  // 4. FORM STATE (Add Device Form)
  // ============================================

  // 📌 WHAT: State for new device name
  // 📌 WHY: Stores what the user types in the name field
  // 📌 WHERE: FRONTEND form state
  const [newDeviceName, setNewDeviceName] = useState('');

  // 📌 WHAT: State for new device type
  // 📌 WHY: Stores what the user selects in the type dropdown
  // 📌 WHERE: FRONTEND form state
  const [newDeviceType, setNewDeviceType] = useState('Server');

  // 📌 WHAT: State for new device IP address
  // 📌 WHY: Stores what the user types in the IP field
  // 📌 WHERE: FRONTEND form state
  const [newDeviceIP, setNewDeviceIP] = useState('');

  // ============================================
  // 5. DATA LOADING FUNCTION
  // ============================================

  // 📌 WHAT: Loads devices from the database
  // 📌 WHY: Called when the component first loads
  // 📌 HOW: Fetches devices from the API and updates state
  // 📌 WHERE: FRONTEND data fetching
  const loadDevices = async () => {
    try {
      setLoading(true);  // 📌 Show loading spinner
      
      // 📌 Get the current user from localStorage
      const currentUser = getCurrentUser();
      setUser(currentUser);  // 📌 Save user to state
      
      // 📌 Fetch devices from the backend API
      // 📌 This calls: GET /api/devices
      const devicesData = await getDevices();
      setDevices(devicesData);  // 📌 Save devices to state
      
      setError(null);  // 📌 Clear any previous errors
    } catch (err) {
      // 📌 If something goes wrong, show error message
      setError('Failed to load devices. Please try again.');
      console.error('Error loading devices:', err);
    } finally {
      setLoading(false);  // 📌 Hide loading spinner
    }
  };

  // ============================================
  // 6. COMPONENT MOUNT (Run when page loads)
  // ============================================

  // 📌 WHAT: Runs when the component first loads
  // 📌 WHY: Loads devices from the database
  // 📌 HOW: useEffect would normally be used, but we're calling it directly
  // 📌 WHERE: FRONTEND lifecycle
  // 📌 NOTE: Since we're not using useEffect, we call loadDevices when the component renders
  // 📌 FIX: We'll use useEffect in the next version, but for now we'll call it directly
  React.useEffect(() => {
    loadDevices();
  }, []);  // 📌 Empty array = run only once when component mounts

  // ============================================
  // 7. ADD DEVICE FUNCTION
  // ============================================

  // 📌 WHAT: Handles adding a new device
  // 📌 WHY: Called when the user submits the form
  // 📌 HOW: Sends a POST request to the API
  // 📌 WHERE: FRONTEND form submission
  const handleAddDevice = async (e) => {
    e.preventDefault();  // 📌 Prevents the page from refreshing
    
    try {
      // 📌 Create a new device object from form data
      const newDevice = {
        name: newDeviceName,
        type: newDeviceType,
        ipAddress: newDeviceIP,
        status: 'online',      // 📌 Default status
        cpuUsage: 0,           // 📌 Default CPU usage
        memoryUsage: 0,        // 📌 Default memory usage
        diskUsage: 0,          // 📌 Default disk usage
        location: 'Unknown',   // 📌 Default location
        department: 'IT'       // 📌 Default department
      };
      
      // 📌 Send the new device to the backend API
      // 📌 This calls: POST /api/devices
      const added = await addDevice(newDevice);
      
      // 📌 Add the new device to the list
      setDevices([...devices, added]);  // 📌 Spread operator creates new array
      
      // 📌 Clear the form fields
      setNewDeviceName('');
      setNewDeviceType('Server');
      setNewDeviceIP('');
      
      console.log('✅ Device added:', added);
    } catch (err) {
      console.error('Error adding device:', err);
      alert('Failed to add device. Please try again.');
    }
  };

  //Filter device based on search
  const filteredDevices = devices.filter(device => {
    if (searchTerm === '') return true;

    const search = searchTerm.toLowerCase();


    return (
      device.name?.toLowerCase().includes(search) ||
      device.type?.toLowerCase().includes(search) ||
      device.ipAddress?.toLowerCase().includes(search) 
    );
  });

  // ============================================
  // 8. DELETE DEVICE FUNCTION
  // ============================================

  // 📌 WHAT: Handles deleting a device
  // 📌 WHY: Called when the user clicks the delete button
  // 📌 HOW: Sends a DELETE request to the API
  // 📌 WHERE: FRONTEND delete action
  const handleDeleteDevice = async (id) => {
    // 📌 Ask for confirmation before deleting
    if (!window.confirm('Delete this device?')) return;
    
    try {
      // 📌 Send DELETE request to the backend API
      // 📌 This calls: DELETE /api/devices/:id
      await deleteDevice(id);
      
      // 📌 Remove the device from the list
      setDevices(devices.filter(d => d._id !== id));
      // 📌 .filter() creates a new array without the deleted device
      // 📌 We use _id because MongoDB uses _id, not id
      
      console.log('🗑️ Device deleted');
    } catch (err) {
      console.error('Error deleting device:', err);
      alert('Failed to delete device. Please try again.');
    }
  };

  // ============================================
  // 9. RENDER (What the user sees)
  // ============================================

  // 📌 Show loading state while fetching data
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading devices...</p>
        </div>
      </div>
    );
  }

  // 📌 Show error state if something went wrong
  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={loadDevices}>Retry</button>
        </div>
      </div>
    );
  }

  // 📌 Calculate statistics (real-time calculations)
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.filter(d => d.status === 'offline').length;
  const avgCpu = totalDevices > 0 
    ? (devices.reduce((sum, d) => sum + (d.cpuUsage || 0), 0) / totalDevices).toFixed(1)
    : 0;

  // ============================================
  // 10. RETURN JSX (HTML-like syntax)
  // ============================================

  return (
    <div className="page-container">
      {/* ======================================== */}
      {/* HEADER */}
      {/* ======================================== */}
      <h1>🌐 Network Dashboard</h1>
      
      {/* Show welcome message with user name */}
      {user && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Welcome, {user.name}! 👋
        </p>
      )}

      {/* ======================================== */}
      {/* STATISTICS CARDS */}
      {/* ======================================== */}
      <div className="stats-container">
        <div className="stat-box">
          <span className="stat-number">{totalDevices}</span>
          <span className="stat-label">Total Devices</span>
        </div>
        <div className="stat-box" style={{ background: '#4CAF50' }}>
          <span className="stat-number">{onlineDevices}</span>
          <span className="stat-label">Online</span>
        </div>
        <div className="stat-box" style={{ background: '#f44336' }}>
          <span className="stat-number">{offlineDevices}</span>
          <span className="stat-label">Offline</span>
        </div>
        <div className="stat-box" style={{ background: '#ff9800' }}>
          <span className="stat-number">{avgCpu}%</span>
          <span className="stat-label">Avg CPU Usage</span>
        </div>
      </div>


      {/* Search bar*/}
      <div style = {{
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px'
      }}>
        <div style={{ display:'flex', gap:'10', alignItems:'center'}}>
          <span style={{ fontSize: '24px' }}>#</span>
          <input 
          type="text"
          placeholder='search devices by name, type, IP...'
          value={searchTerm}
          onChange={(e) => setsearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 15px',
            border: '2px solid #ddd',
            borderRadius:'8px',
            fontSize:'16'
          }}
          />
          {searchTerm && (
            <button
            onClick={() => setsearchTerm('')}
            style={{
              padding:'10px, 20px',
              background:'#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            >* clear</button>
          )}

        </div>
        {searchTerm && (
          <p style={{marginTop:'10px', color: '#666', fontSize: '14px'}}>
            found <strong>{filteredDevices.length}</strong> of <strong>{devices.length}</strong> devices
          </p>
        )}
      </div>

      {/* ======================================== */}
      {/* ADD DEVICE FORM */}
      {/* ======================================== */}
      <div className="add-device-section">
        <h3>➕ Add New Device</h3>
        <form onSubmit={handleAddDevice} className="device-form">
          {/* Device Name Input */}
          <input
            type="text"
            placeholder="Device Name"
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
            required
          />
          
          {/* Device Type Dropdown */}
          <select
            value={newDeviceType}
            onChange={(e) => setNewDeviceType(e.target.value)}
          >
            <option value="Server">Server</option>
            <option value="Network Device">Network Device</option>
            <option value="Workstation">Workstation</option>
            <option value="Printer">Printer</option>
            <option value="Other">Other</option>
          </select>
          
          {/* IP Address Input */}
          <input
            type="text"
            placeholder="IP Address (e.g., 192.168.1.100)"
            value={newDeviceIP}
            onChange={(e) => setNewDeviceIP(e.target.value)}
            required
          />
          
          <button type="submit">Add Device</button>
        </form>
      </div>

      {/* ======================================== */}
      {/* DEVICES GRID */}
      {/* ======================================== */}
      {filteredDevices.length === 0 ? (
        // Show message if no devices
        <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No devices found. Add your first device above! 🚀
        </p>
      ) : (
        // Show devices in a grid
        <div className="devices-grid">
          {/* Map through each device and create a card */}
          {filteredDevices.map(device => (
            <div key={device._id} className="device-card">
              {/* 📌 Delete Button */}
              <button 
                className="delete-btn" 
                onClick={() => handleDeleteDevice(device._id)}
              >
                🗑️
              </button>
              
              {/* 📌 Device Name and Status */}
              <div className="device-header">
                <h3>{device.name}</h3>
                <span className={`status-badge ${device.status || 'offline'}`}>
                  {device.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
              
              {/* 📌 Device Details */}
              <div className="device-details">
                <p><strong>Type:</strong> {device.type}</p>
                <p><strong>IP:</strong> {device.ipAddress}</p>
                <p><strong>Location:</strong> {device.location || 'Unknown'}</p>
              </div>
              
              {/* 📌 Device Metrics (CPU, Memory, Disk) */}
              <div className="device-metrics">
                {/* CPU */}
                <div className="metric">
                  <span>CPU</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ 
                        width: `${device.cpuUsage || 0}%`,
                        background: (device.cpuUsage || 0) > 80 ? '#f44336' : 
                                   (device.cpuUsage || 0) > 60 ? '#ff9800' : '#4CAF50'
                      }}
                    >
                      {device.cpuUsage || 0}%
                    </div>
                  </div>
                </div>
                
                {/* Memory */}
                <div className="metric">
                  <span>Memory</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ 
                        width: `${device.memoryUsage || 0}%`,
                        background: (device.memoryUsage || 0) > 80 ? '#f44336' : 
                                   (device.memoryUsage || 0) > 60 ? '#ff9800' : '#4CAF50'
                      }}
                    >
                      {device.memoryUsage || 0}%
                    </div>
                  </div>
                </div>
                
                {/* Disk */}
                <div className="metric">
                  <span>Disk</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill" 
                      style={{ 
                        width: `${device.diskUsage || 0}%`,
                        background: (device.diskUsage || 0) > 80 ? '#f44336' : 
                                   (device.diskUsage || 0) > 60 ? '#ff9800' : '#4CAF50'
                      }}
                    >
                      {device.diskUsage || 0}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 📌 Device Footer */}
              <div className="device-footer">
                <small>ID: {device._id}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 11. EXPORT
// ============================================

// 📌 WHAT: Exports the component for use in other files
// 📌 WHY: Allows App.js to import and use this component
// 📌 WHERE: FRONTEND module export
export default NetworkDashboard;