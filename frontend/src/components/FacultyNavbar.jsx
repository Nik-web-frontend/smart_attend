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
          to="/generate-qr"
          className={location.pathname === "/generate-qr" ? "active" : ""}
        >
          Classes
        </Link>

        <Link
          to="/teacher/my-attendance"
          className={
            location.pathname === "/teacher/my-attendance" ? "active" : ""
          }
        >
          Attendance
        </Link>

        <Link
          to="/teacher/manual-attendance"
          className={
            location.pathname === "/teacher/manual-attendance" ? "active" : ""
          }
        >
          Manual Attendance
        </Link>
      </div>

      {/* Right */}
      <div className="navbar-right">
        <span className="faculty-name">Profile</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default FacultyNavbar;