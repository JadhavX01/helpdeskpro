import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear stored credentials
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    // Update state in App so Navbar disappears
    setToken(null);

    // Redirect to login page (which is "/")
    navigate("/");
  };

  return (
    <nav style={{ background: "#222", padding: "10px" }}>
      <button
        onClick={() => navigate("/tickets")}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          marginRight: "10px",
          cursor: "pointer",
        }}
      >
        Home
      </button>
      <button
        onClick={handleLogout}
        style={{
          background: "red",
          border: "none",
          color: "white",
          padding: "5px 10px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </nav>
  );
}
