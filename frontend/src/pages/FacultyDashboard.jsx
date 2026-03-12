// src/pages/FacultyDashboard.jsx
// import React from "react";
import FacultyNavbar from "../components/FacultyNavbar";
import { FaChalkboardTeacher, FaUsers, FaCalendarDay, FaClipboardList, FaClock, FaCheckCircle, FaChartBar, FaBullseye } from "react-icons/fa";
import "./facultyDashboard.css";
import AttendanceTrend from "../components/AttendanceTrend";

const FacultyDashboard = () => {
    // Dummy data, replace with API later
    const totalClasses = 3;
    const totalStudents = 120;
    const todaysSessions = 2;

    const sessions = [
        { className: "Math 101", date: "2026-02-18", attendance: "25/30", status: "Completed" },
        { className: "Physics 201", date: "2026-02-17", attendance: "28/30", status: "Completed" },
        { className: "Chemistry 101", date: "2026-02-16", attendance: "22/30", status: "Pending" },
        { className: "Computer Sci 102", date: "2026-02-15", attendance: "30/30", status: "Completed" },
    ];

    return (
        <>
            <FacultyNavbar />
            <div className="faculty-dashboard-container">
                {/* First Section: Stats Cards */}
                <div className="cards-section">
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <FaChalkboardTeacher size={30} color="#16a34a" />
                        </div>
                        <h3>Total Classes</h3>
                        <p>{totalClasses}</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">
                            <FaUsers size={30} color="#16a34a" />
                        </div>
                        <h3>Total Students</h3>
                        <p>{totalStudents}</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">
                            <FaCalendarDay size={30} color="#16a34a" />
                        </div>
                        <h3>Today's Sessions</h3>
                        <p>{todaysSessions}</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">
                            <FaClipboardList size={30} color="#16a34a" />
                        </div>
                        <h3>View Attendance</h3>
                        <p>
                            <a href="/teacher/view-attendance-records">Go</a>
                        </p>
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
                                onClick={() => window.location.href = "/teacher/create-subject"}
                            >
                                Create Class
                            </button>

                            <button
                                className="action-btn"
                                onClick={() => window.location.href = "/generate-qr"}
                            >
                                Start Attendance
                            </button>

                            <button
                                className="action-btn"
                                onClick={() => window.location.href = "/teacher/view-attendance-records"}
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
                                    <th>Class</th>
                                    <th>Date</th>
                                    <th>Attendance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session, index) => (
                                    <tr key={index}>
                                        <td>{session.className}</td>
                                        <td>{session.date}</td>
                                        <td>{session.attendance}</td>
                                        <td>
                                            <span
                                                className={`status ${session.status === "Completed" ? "completed" : "pending"
                                                    }`}
                                            >
                                                {session.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
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