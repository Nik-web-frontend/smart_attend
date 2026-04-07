import { useEffect, useState } from "react";
import axios from "axios";
import "./viewAttendance.css";
import FacultyNavbar from "../components/FacultyNavbar";

const ViewAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/teacher/my-attendance`,
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

  const filteredAttendance = attendance.filter((item) => {
    const query = search.toLowerCase();

    // Convert all fields to string and lowercase for safe comparison
    const name = (item.student?.fullName || "").toString().toLowerCase();
    const enrollment = (item.student?.enrollmentNo || "").toString().toLowerCase();
    const className = (item.className || item.qr?.className || "").toString().toLowerCase();
    const subject = (item.subject || item.qr?.subject || "").toString().toLowerCase();
    const status = (item.status || "Present").toString().toLowerCase();

    // Convert date to a readable string for search
    const date = item.date
      ? new Date(item.date).toLocaleDateString()
      : item.scannedAt
      ? new Date(item.scannedAt).toLocaleDateString()
      : "";
    const dateLower = date.toLowerCase();

    // Also include time if needed
    const time = item.scannedAt
      ? new Date(item.scannedAt).toLocaleTimeString()
      : "";
    const timeLower = time.toLowerCase();

    return (
      name.includes(query) ||
      enrollment.includes(query) ||
      className.includes(query) ||
      subject.includes(query) ||
      status.includes(query) ||
      dateLower.includes(query) ||
      timeLower.includes(query)
    );
  });

  return (
    <>
      <FacultyNavbar />
      <div className="attend-page">
        <div className="attendance-header">
          <h2>Attendance Records</h2>
          <input
            type="text"
            placeholder="Search by name, enrollment, class, subject, date, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="attendance-search"
          />
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
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No attendance found
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((item) => (
                  <tr key={item._id}>
                    <td>{item.student?.fullName || "Unknown"}</td>
                    <td>{item.student?.enrollmentNo || "-"}</td>
                    <td>{item.className || item.qr?.className || "-"}</td>
                    <td>{item.subject || item.qr?.subject || "-"}</td>
                    <td>
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : new Date(item.scannedAt).toLocaleDateString()}
                      {!item.date && (
                        <span className="time">
                          <br />
                          {new Date(item.scannedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </td>
                    <td>{item.status || "Present"}</td>
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