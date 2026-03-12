// src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "student") {
      navigate("/student-dashboard");
    } else if (user.role === "teacher") {
      navigate("/faculty-dashboard");
    }
  }, [user, navigate]);

  return null;
};

export default Dashboard;