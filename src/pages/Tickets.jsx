import React, { useState, useEffect } from "react";
import API from "../services/api";
import "./Tickets.css";

export default function Tickets({ token }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });
  const [tickets, setTickets] = useState([]);
  const [role] = useState(localStorage.getItem("role"));
  const [isLoading, setIsLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState("all");

  const fetchTickets = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const endpoint = role === "admin" ? "/tickets" : "/tickets/my";
      const { data } = await API.get(endpoint);
      setTickets(data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await API.post("/tickets", form);
      setForm({ title: "", description: "", priority: "medium" });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.error || "Error creating ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setIsLoading(true);
      const { data } = await API.put(`/tickets/${id}/status`, { status: newStatus });
      alert(data.message || "Status updated");
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.error || "Error updating status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [token, role]);

  const filteredTickets = activeStatus === "all" 
    ? tickets 
    : tickets.filter(ticket => ticket.status === activeStatus);

  return (
    <div className="tickets-page">
      {/* Header */}
      <div className="tickets-header">
        <h2>{role === "admin" ? "Ticket Management" : "My Support Tickets"}</h2>
        <div className="controls">
          <button 
            onClick={fetchTickets} 
            className="refresh-btn"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Ticket Creation Form (for regular users) */}
      {role !== "admin" && (
        <div className="ticket-form">
          <h3>Create New Ticket</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Ticket title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Describe your issue in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Filter */}
      <div className="status-filter">
        <button 
          className={activeStatus === "all" ? "active" : ""}
          onClick={() => setActiveStatus("all")}
        >
          All Tickets
        </button>
        <button 
          className={activeStatus === "open" ? "active" : ""}
          onClick={() => setActiveStatus("open")}
        >
          Open
        </button>
        <button 
          className={activeStatus === "in_progress" ? "active" : ""}
          onClick={() => setActiveStatus("in_progress")}
        >
          In Progress
        </button>
        <button 
          className={activeStatus === "resolved" ? "active" : ""}
          onClick={() => setActiveStatus("resolved")}
        >
          Resolved
        </button>
      </div>

      {/* Tickets Table */}
      <div className="tickets-table-container">
        {isLoading && tickets.length === 0 ? (
          <div className="loading">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="no-tickets">No tickets found</div>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Title</th>
                {role === "admin" && <th>User</th>}
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                {role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className={`priority-${ticket.priority}`}>
                  <td>{ticket.title}</td>
                  {role === "admin" && <td>{ticket.user_name}</td>}
                  <td>{ticket.description}</td>
                  <td>
                    <span className={`priority-badge ${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${ticket.status}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  {role === "admin" && (
                    <td>
                      <select
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}