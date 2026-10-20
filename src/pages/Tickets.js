// ============================================
// FILE: src/pages/Tickets.js
// ============================================
// WHAT: IT Support Ticket Management
// WHY: Create, view, and manage support tickets
// WHERE: FRONTEND component (React page)

import React, { useState, useEffect } from 'react';
import { getTickets, createTicket, updateTicket, deleteTicket, getCurrentUser } from '../services/api';

function Tickets() {
  // ============================================
  // STATE
  // ============================================
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  // ============================================
  // LOAD TICKETS
  // ============================================
  const loadTickets = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      const ticketsData = await getTickets();
      setTickets(ticketsData);
      setError(null);
    } catch (err) {
      setError('Failed to load tickets');
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CREATE TICKET
  // ============================================
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (!newTitle || !newDescription) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const ticketData = {
        title: newTitle,
        description: newDescription,
        priority: newPriority
      };
      
      const newTicket = await createTicket(ticketData);
      setTickets([newTicket, ...tickets]); // Add to beginning of list
      
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewPriority('medium');
      setShowForm(false);
      
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Failed to create ticket');
    }
  };

  // ============================================
  // UPDATE TICKET STATUS
  // ============================================
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const updated = await updateTicket(id, { status: newStatus });
      setTickets(tickets.map(ticket => 
        ticket._id === id ? updated : ticket
      ));
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Failed to update ticket');
    }
  };

  // ============================================
  // DELETE TICKET
  // ============================================
  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    
    try {
      await deleteTicket(id);
      setTickets(tickets.filter(ticket => ticket._id !== id));
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert('Failed to delete ticket');
    }
  };

  // ============================================
  // GET PRIORITY COLOR
  // ============================================
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#9e9e9e';
    }
  };

  // ============================================
  // GET STATUS COLOR
  // ============================================
  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#f44336';
      case 'in-progress': return '#ff9800';
      case 'resolved': return '#4CAF50';
      case 'closed': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  // ============================================
  // LOAD DATA ON MOUNT
  // ============================================
  useEffect(() => {
    loadTickets();
  }, []);

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={loadTickets}>Retry</button>
        </div>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;

  return (
    <div className="page-container">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🎫 Support Tickets</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ 
            background: '#ff9800', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '20px',
            fontWeight: 'bold'
          }}>
            {openTickets} open tickets
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showForm ? '✖ Cancel' : '➕ New Ticket'}
          </button>
        </div>
      </div>

      {user && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Welcome, {user.name}! 👋
        </p>
      )}

      {/* CREATE TICKET FORM */}
      {showForm && (
        <div style={{
          background: '#f8f9fa',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '25px',
          border: '2px solid #667eea'
        }}>
          <h3 style={{ marginBottom: '15px' }}>📝 Create New Ticket</h3>
          <form onSubmit={handleCreateTicket}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter ticket title"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe the issue..."
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <button
              type="submit"
              style={{
                padding: '10px 25px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              🚀 Create Ticket
            </button>
          </form>
        </div>
      )}

      {/* TICKETS LIST */}
      {tickets.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No tickets found. Create your first ticket above! 🎫
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tickets.map(ticket => (
            <div 
              key={ticket._id}
              style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0 }}>{ticket.title}</h3>
                    <span style={{
                      padding: '2px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: getPriorityColor(ticket.priority),
                      color: 'white'
                    }}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span style={{
                      padding: '2px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: getStatusColor(ticket.status),
                      color: 'white'
                    }}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: '#666', margin: '8px 0' }}>{ticket.description}</p>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                    {ticket.assignedTo !== 'Unassigned' && ` • Assigned to: ${ticket.assignedTo}`}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {/* Status Update Dropdown */}
                  <select
                    value={ticket.status}
                    onChange={(e) => handleUpdateStatus(ticket._id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  
                  <button
                    onClick={() => handleDeleteTicket(ticket._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REFRESH BUTTON */}
      <button 
        onClick={loadTickets}
        style={{
          marginTop: '20px',
          padding: '10px 25px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🔄 Refresh Tickets
      </button>
    </div>
  );
}

export default Tickets;