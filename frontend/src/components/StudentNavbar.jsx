// src/components/StudentNavbar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./studentNavbar.css";

const StudentNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="student-navbar">
      {/* Left */}
      <div className="navbar-left">
        <h2 className="logo">SmartAttend</h2>
      </div>

      {/* Center */}
      <div className="navbar-center">
        <Link
          to="/student-dashboard"
          className={location.pathname === "/student-dashboard" ? "active" : ""}
        >
          Dashboard
        </Link>

        <Link
          to="/scan-qr"
          className={location.pathname === "/scan-qr" ? "active" : ""}
        >
          Scan
        </Link>

        <Link
          to="/student/attendance-history"
          className={
            location.pathname === "/student/attendance-history" ? "active" : ""
          }
        >
          Attendance
        </Link>

      
      </div>

      {/* Right */}
      <div className="navbar-right">

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default StudentNavbar;