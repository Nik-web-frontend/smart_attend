import React, { useState, useEffect } from "react";
import "./attendanceTrend.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AttendanceTrend = () => {
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");

  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState(["All"]);
  const [classes, setClasses] = useState(["All"]);

  // 🔥 FETCH TREND (UPDATED)
  const fetchTrend = async (subject = "All", className = "All") => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/teacher/attendance-trend?subject=${subject}&className=${className}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 FETCH SUBJECTS
  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/teacher/subjects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setSubjects(data.subjects || ["All"]);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 FETCH CLASSES (NEW)
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/teacher/classes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setClasses(data.classes || ["All"]);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 INITIAL LOAD
  useEffect(() => {
    fetchSubjects();
    fetchClasses(); // ✅ important
  }, []);

  // 🔥 AUTO REFRESH
  useEffect(() => {
    fetchTrend(selectedSubject, selectedClass);

    const interval = setInterval(() => {
      fetchTrend(selectedSubject, selectedClass);
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedSubject, selectedClass]);

  return (
    <div className="trend-section">
      <div className="trend-header">
        <div className="trend-title">
          <h3>Attendance Trend</h3>
          <span className="trend-subtitle">
            Last 7 Days (%) - {selectedSubject} ({selectedClass})
          </span>
        </div>

        {/* DROPDOWNS */}
        <div className="dropdown-group">
          <label>Subject</label>
          <select
            className="subject-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="dropdown-group">
          <label>Class</label>
          <select
            className="subject-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="attendance"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceTrend;