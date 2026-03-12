import { useEffect, useState } from "react";
import axios from "axios";
import "./viewAttendance.css";
import FacultyNavbar from "../components/FacultyNavbar";

const ViewAttendance = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/teacher/my-attendance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAttendance(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <FacultyNavbar />
      <div className="attend-page">
        <div className="attendance-header">
          <h2>Attendance Records</h2>
        </div>

        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Enrollment</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No attendance found
                  </td>
                </tr>
              ) : (
                attendance.map((item) => (
                  <tr key={item._id}>
                    <td>{item.student?.fullName || "Unknown"}</td>
                    <td>{item.student?.enrollmentNo || "-"}</td>
                    <td>{item.qr?.className || "-"}</td>
                    <td>{item.qr?.subject || "-"}</td>
                    <td>
                      {new Date(item.scannedAt).toLocaleDateString()} <br />
                      <span className="time">
                        {new Date(item.scannedAt).toLocaleTimeString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ViewAttendance;