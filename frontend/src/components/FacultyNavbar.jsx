// src/components/FacultyNavbar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./facultyNavbar.css";

const FacultyNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="faculty-navbar">
      {/* Left */}
      <div className="navbar-left">
        <h2 className="logo">SmartAttend</h2>
      </div>

      {/* Center */}
      <div className="navbar-center">
        <Link
          to="/faculty-dashboard"
          className={location.pathname === "/faculty-dashboard" ? "active" : ""}
        >
          Dashboard
        </Link>

        <Link
          to="/upload-file-autoqr"
          className={location.pathname === "/upload-file-autoqr" ? "active" : ""}
        >
          Classes
        </Link>

        <Link
          to="/attendance"
          className={
            location.pathname === "/attendance" ? "active" : ""
          }
        >
          Attendance
        </Link>

        <Link
          to="/upload-attendance"
          className={
            location.pathname === "/upload-attendance" ? "active" : ""
          }
        >
          Manual Attendance
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

export default FacultyNavbar;