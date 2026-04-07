// src/pages/FacultyDashboard.jsx
import { React, useState, useEffect } from "react";
import FacultyNavbar from "../components/FacultyNavbar";
import { FaChalkboardTeacher, FaUsers, FaBook, FaCalendarDay, FaClipboardList, FaClock, FaCheckCircle, FaChartBar, FaBullseye } from "react-icons/fa";
import "./facultyDashboard.css";
import AttendanceTrend from "../components/AttendanceTrend";

const FacultyDashboard = () => {

    const [nextLecture, setNextLecture] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [sessionMessage, setSessionMessage] = useState("");



    useEffect(() => {
        const fetchNextLecture = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/teacher/next-lecture`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();
                setNextLecture(data);

            } catch (err) {
                console.error(err);
            }
        };

        // 🔥 first load
        fetchNextLecture();

        // 🔥 auto refresh every 10 sec
        const interval = setInterval(fetchNextLecture, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/teacher/recent-sessions`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();

                if (data.message) {
                    setSessionMessage(data.message);
                }

                setSessions(data.sessions || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchSessions();
        // 🔥 auto refresh every 10 sec
        const interval = setInterval(fetchSessions, 10000);
        return () => clearInterval(interval);
    }, []);


    // Dummy data, replace with API later
    const totalClasses = 3;
    const totalStudents = 120;
    const todaysSessions = 2;

    // const sessions = [
    //     { className: "Math 101", date: "2026-02-18", attendance: "25/30", status: "Completed" },
    //     { className: "Physics 201", date: "2026-02-17", attendance: "28/30", status: "Completed" },
    //     { className: "Chemistry 101", date: "2026-02-16", attendance: "22/30", status: "Pending" },
    //     { className: "Computer Sci 102", date: "2026-02-15", attendance: "30/30", status: "Completed" },
    // ];

    return (
        <>
            <FacultyNavbar />
            <div className="faculty-dashboard-container">
                {/* First Section: Stats Cards */}
                <div className="cards-section">
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <FaBook size={30} color="#16a34a" />
                        </div>
                        <h3>Next Subject</h3>

                        {nextLecture?.message === "No timetable uploaded" ? (
                            <p>No data</p>
                        ) : nextLecture ? (
                            <p>{nextLecture.subject}</p>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">
                            <FaUsers size={30} color="#16a34a" />
                        </div>
                        <h3>Class</h3>

                        {nextLecture?.message === "No timetable uploaded" ? (
                            <p>No data</p>
                        ) : nextLecture ? (
                            <p>{nextLecture.class}</p>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">
                            <FaClock size={30} color="#16a34a" />
                        </div>
                        <h3>Start Time</h3>

                        {nextLecture?.message === "No timetable uploaded" ? (
                            <p>No data</p>
                        ) : nextLecture ? (
                            <p>{nextLecture.startTime}</p>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">
                            <FaCalendarDay size={30} color="#16a34a" />
                        </div>
                        <h3>Day</h3>

                        {nextLecture?.message === "No timetable uploaded" ? (
                            <p>No data</p>
                        ) : nextLecture ? (
                            <p>{nextLecture.day}</p>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>
                </div>

                <div className="section-two">
                    <div className="section-two-container">
                        {/* Left Column: Tip */}
                        <div className="section-col left-col">
                            <div className="tip-box">
                                <span>Start your classes</span>
                                <span className="tip-line-two">Efficiently</span>
                            </div>
                        </div>

                        {/* Middle Column: Buttons */}
                        <div className="section-col middle-col">
                            <button
                                className="action-btn"
                                onClick={() => window.location.href = "/generate-qr"}
                            >
                                Create Class
                            </button>

                            <button
                                className="action-btn"
                                onClick={() => window.location.href = "/upload-attendance"}
                            >
                                Start Attendance
                            </button>

                            <button
                                className="action-btn"
                                onClick={() => window.location.href = "/report"}
                            >
                                View Reports
                            </button>
                        </div>

                        {/* Right Column: Keywords Zig-Zag */}
                        <div className="section-col right-col">
                            <div className="keyword-row">
                                <FaClock className="icon" />
                                <span className="text">Time-consuming</span>
                            </div>
                            <div className="keyword-row right">
                                <span className="text">Accurate</span>
                                <FaCheckCircle className="icon" />
                            </div>
                            <div className="keyword-row">
                                <FaChartBar className="icon" />
                                <span className="text">Real-time Stats</span>
                            </div>
                            {/* <div className="keyword-row right">
                                <span className="text">Easy to track</span>
                                <FaBullseye className="icon" />
                            </div> */}
                        </div>
                    </div>
                </div>

                <div className="section-three">
                    <h3 className="section-title">Recent Sessions</h3>
                    <div className="table-container">
                        <table className="recent-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Class</th>
                                    <th>Day</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessionMessage === "No timetable uploaded" ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center" }}>
                                            No timetable uploaded
                                        </td>
                                    </tr>
                                ) : sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center" }}>
                                            No recent sessions
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.map((session, index) => (
                                        <tr key={index}>
                                            <td>{session.subject}</td>
                                            <td>{session.className}</td>
                                            <td>{session.date}</td>
                                            <td>
                                                <span
                                                    className={`status ${session.status === "Completed"
                                                        ? "completed"
                                                        : session.status === "Live"
                                                            ? "pending"
                                                            : ""
                                                        }`}
                                                >
                                                    {session.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AttendanceTrend />

            </div>
        </>
    );
};

export default FacultyDashboard;