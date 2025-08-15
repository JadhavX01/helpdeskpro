import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Tickets from "./pages/Tickets";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      {/* Show Navbar only if logged in */}
      {token && <Navbar setToken={setToken} />}

      <Routes>
        {/* Auth/Login Page */}
        <Route path="/" element={<Auth setToken={setToken} />} />

        {/* User Tickets Page */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute allowedRole="user">
              <Tickets token={token} /> {/* ✅ Pass token */}
            </ProtectedRoute>
          }
        />

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminPanel token={token} /> {/* ✅ Pass token */}
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
