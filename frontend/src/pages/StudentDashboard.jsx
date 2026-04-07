// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StudentNavbar from "../components/StudentNavbar";
import StudentCard from "../components/StudentCard";
import Analytical from "../components/Analytical";
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

  const [nextLecture, setNextLecture] = useState(null);
  const [loadingLecture, setLoadingLecture] = useState(true);

  const fetchNextLecture = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/student/next-lecture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNextLecture(res.data.lecture);
    } catch (error) {
      console.error("Error fetching next lecture:", error);
      setNextLecture(null);
    } finally {
      setLoadingLecture(false);
    }
  };

  const fetchTodaySessions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/student/recent-session`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data;

      if (data.message === "No sessions today") {
        setTodaySessions([]);
        return;
      }

      setTodaySessions(data.sessions || []);
      setAttendanceStats({
        totalLecturesToday: data.totalLecturesToday || 0,
        todayAttend: data.todayAttend || 0,
      });

    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  // useEffect(() => {
  //   fetchTodaySessions();

  //   const interval = setInterval(fetchTodaySessions, 10000); // refresh every 10s

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    fetchTodaySessions();
    fetchNextLecture();

    const interval = setInterval(() => {
      fetchTodaySessions();
      fetchNextLecture();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <StudentNavbar />
      <StudentCard />

      <div className="dashboard-page">

        <div className="attendance-cards">
          <div className="stat-card">
            <h3>Upcoming Lecture</h3>
            <p>{loadingLecture ? "Loading..." : nextLecture?.subject || "No Lecture"}</p>
          </div>

          <div className="stat-card">
            <h3>Class</h3>
            <p>{loadingLecture ? "Loading..." : nextLecture?.class || "-"}</p>
          </div>

          <div className="stat-card">
            <h3>Start Time</h3>
            <p>{loadingLecture ? "Loading..." : nextLecture?.startTime || "-"}</p>
          </div>

          <div className="stat-card">
            <h3>Day</h3>
            <p>{loadingLecture ? "Loading..." : nextLecture?.day || "-"}</p>
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
        <Analytical/>
      </div>
        

    </>
  );
};

export default StudentDashboard;