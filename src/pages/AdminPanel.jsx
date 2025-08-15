// client/src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./AdminPanel.css"; // Create this CSS file

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    open: 0,
    in_progress: 0,
    resolved: 0
  });

  const fetchAllTickets = async (searchQuery = "") => {
    try {
      setIsLoading(true);
      const { data } = await API.get(`/tickets?search=${searchQuery}`);
      setTickets(data);
      
      // Calculate statistics
      setStats({
        open: data.filter(t => t.status === "open").length,
        in_progress: data.filter(t => t.status === "in_progress").length,
        resolved: data.filter(t => t.status === "resolved").length
      });
    } catch (err) {
      alert(err.response?.data?.error || "Error fetching tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setIsLoading(true);
      const { data } = await API.put(`/tickets/${id}/status`, { status: newStatus });
      alert(data.message);
      fetchAllTickets(search);
    } catch (err) {
      alert(err.response?.data?.error || "Error updating ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      setIsLoading(true);
      const { data } = await API.delete(`/tickets/${id}`);
      alert(data.message);
      fetchAllTickets(search);
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting ticket");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2 className="mb-4">Ticket Management Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="stats-container mb-4">
          <div className="stat-card bg-primary">
            <div className="stat-number">{stats.open}</div>
            <div className="stat-label">Open Tickets</div>
          </div>
          <div className="stat-card bg-warning">
            <div className="stat-number">{stats.in_progress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card bg-success">
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card bg-info">
            <div className="stat-number">{tickets.length}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="search-container mb-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, status, or user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchAllTickets(e.target.value);
              }}
            />
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={() => {
                setSearch("");
                fetchAllTickets("");
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          {isLoading && tickets.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No tickets found
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">User</th>
                    <th scope="col">Title</th>
                    <th scope="col">Description</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className={getPriorityClass(ticket.priority)}>
                      <td className="fw-bold">#{ticket.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar me-2">
                            {ticket.user_name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{ticket.user_name}</span>
                        </div>
                      </td>
                      <td>{ticket.title}</td>
                      <td className="text-truncate" style={{maxWidth: "200px"}} title={ticket.description}>
                        {ticket.description}
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <select
                            className="form-select form-select-sm"
                            value={ticket.status}
                            onChange={(e) => updateStatus(ticket.id, e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteTicket(ticket.id)}
                            disabled={isLoading}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions for styling
function getPriorityClass(priority) {
  switch(priority) {
    case 'high': return 'table-danger';
    case 'medium': return 'table-warning';
    default: return '';
  }
}

function getPriorityBadgeClass(priority) {
  switch(priority) {
    case 'high': return 'bg-danger';
    case 'medium': return 'bg-warning';
    default: return 'bg-success';
  }
}

function getStatusBadgeClass(status) {
  switch(status) {
    case 'open': return 'bg-secondary';
    case 'in_progress': return 'bg-info';
    case 'resolved': return 'bg-success';
    default: return 'bg-light text-dark';
  }
}