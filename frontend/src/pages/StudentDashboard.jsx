// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StudentNavbar from "../components/StudentNavbar";
import StudentCard from "../components/StudentCard";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [todaySessions, setTodaySessions] = useState([]);

  const [attendanceStats, setAttendanceStats] = useState({
    totalLecturesToday: 0,
    totalAttend: 0,
    todayAttend: 0,
  });


  const fetchAttendanceStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/student/attendance-stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { totalLecturesToday, totalAttend, todayAttend, todaysSessions } = res.data;

      setAttendanceStats({ totalLecturesToday, totalAttend, todayAttend });
      setTodaySessions(Array.isArray(todaysSessions) ? todaysSessions : []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      alert("Failed to load attendance stats");
    }
  };

  // Recent Session 

  useEffect(() => {
    fetchAttendanceStats();

  }, []);

  


  const todayPercentage =
    attendanceStats.totalLecturesToday > 0
      ? Math.round(
        (attendanceStats.todayAttend / attendanceStats.totalLecturesToday) * 100
      )
      : 0;

  return (
    <>
      <StudentNavbar />
      <StudentCard />

      <div className="dashboard-page">

        {/* Attendance Stats Cards */}
        <div className="attendance-cards">
          <div className="stat-card">
            <h3>Today's Lectures</h3>
            <p>{attendanceStats.totalLecturesToday}</p>
          </div>
          <div className="stat-card">
            <h3>Total Attended</h3>
            <p>{attendanceStats.totalAttend}</p>
          </div>
          <div className="stat-card">
            <h3>Not Attended</h3>
            <p>{attendanceStats.totalLecturesToday - attendanceStats.todayAttend}</p>
          </div>
          <div className="stat-card">
            <h3>Today's Attendance %</h3>
            <p>{todayPercentage}%</p>
          </div>
        </div>

        {/* Today's Sessions Table */}
        {todaySessions.length > 0 && (
          <div className="recent-session-table-wrapper">
            <h3>Today's Sessions: {attendanceStats.totalLecturesToday}</h3>
            <table className="recent-session-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todaySessions.map((session) => (
                  <tr key={session._id}>
                    <td>{session.subject}</td>
                    <td>{session.className}</td>
                    <td>{new Date(session.date).toLocaleString()}</td>
                    <td
                      style={{
                        color: session.attended ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {session.attended ? "Attended" : "Not Attended"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {todaySessions.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "10px" }}>No sessions today</p>
        )}
      </div>
    </>
  );
};

export default StudentDashboard;