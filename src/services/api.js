// ============================================
// FILE: src/services/api.js
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// ============================================
// HELPER: Get Auth Token
// ============================================
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// ============================================
// HELPER: Create Headers with Auth
// ============================================
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// ============================================
// AUTH API CALLS
// ============================================

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ============================================
// DEVICE API CALLS
// ============================================

export const getDevices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        logoutUser();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

export const addDevice = async (device) => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(device)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding device:', error);
    throw error;
  }
};

export const deleteDevice = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting device ${id}:`, error);
    throw error;
  }
};

// ============================================
// ALERT API CALLS
// ============================================

export const getAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const createAlert = async (alertData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(alertData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const acknowledgeAlert = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}/acknowledge`, {
      method: 'PUT',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error acknowledging alert ${id}:`, error);
    throw error;
  }
};

// ============================================
// TICKET API CALLS
// ============================================

export const getTickets = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
};

export const createTicket = async (ticketData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(ticketData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const updateTicket = async (id, ticketData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(ticketData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating ticket ${id}:`, error);
    throw error;
  }
};

export const deleteTicket = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting ticket ${id}:`, error);
    throw error;
  }
};



//Upload API Calls

export const uploadImage = async (file) => {

  const formData = new FormData();

  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers:{
      'Authorization': `Bearer ${localStorage.getItem('token')}`

    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'upload failed');
  }
  return await response.json();
};