import React, { useEffect, useState } from "react";
import axios from "axios";
import "./studentAttendance.css";
import StudentNavbar from "../components/StudentNavbar";

const StudentAttendance = () => {
    const [records, setRecords] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/student/attendance-history`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setRecords(res.data);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    return (
        <>
            <StudentNavbar />
            <div className="attendance-page">
                <div className="attendance-card">
                    <h2 className="attendance-title">Attendance History</h2>

                    {records.length === 0 ? (
                        <p className="no-records">No attendance records found</p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Class</th>
                                        <th>Date & Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((item, index) => (
                                        <tr key={item._id}>
                                            <td>{item.subject}</td>
                                            <td>{item.className}</td>
                                            <td>{new Date(item.date).toLocaleString()}</td>
                                            <td>
                                                <span
                                                    className={
                                                        item.status === "Present"
                                                            ? "status present"
                                                            : "status absent"
                                                    }
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentAttendance;