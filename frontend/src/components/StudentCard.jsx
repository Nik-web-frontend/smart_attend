import React, { useEffect, useState } from "react";
import "./studentCard.css";

const StudentDashboard = () => {
  const [student, setStudent] = useState({
    fullName: "",
    enrollmentNo: "",
    className: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setStudent({
        fullName: storedUser.fullName || "Unknown",
        enrollmentNo: storedUser.enrollmentNo || "-",
        className: storedUser.className || "-",
      });
    }
  }, []);

  
  return (
    <div className="dashboard-page">
      <div className="profile-card">
        <div className="profile-item">
          <span className="label">Name:</span>
          <span className="value">{student.fullName}</span>
        </div>
        <div className="profile-item">
          <span className="label">Enrollment:</span>
          <span className="value">{student.enrollmentNo}</span>
        </div>
        <div className="profile-item">
          <span className="label">Class:</span>
          <span className="value">{student.className}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;