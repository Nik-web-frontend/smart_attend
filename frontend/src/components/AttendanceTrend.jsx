import React, { useState } from "react";
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

  // Sample data per subject
  const subjectData = {
    All: [
      { day: "Mon", attendance: 80 },
      { day: "Tue", attendance: 85 },
      { day: "Wed", attendance: 78 },
      { day: "Thu", attendance: 90 },
      { day: "Fri", attendance: 88 },
    ],
    "Math 101": [
      { day: "Mon", attendance: 75 },
      { day: "Tue", attendance: 82 },
      { day: "Wed", attendance: 70 },
      { day: "Thu", attendance: 88 },
      { day: "Fri", attendance: 85 },
    ],
    "Physics 201": [
      { day: "Mon", attendance: 85 },
      { day: "Tue", attendance: 90 },
      { day: "Wed", attendance: 88 },
      { day: "Thu", attendance: 92 },
      { day: "Fri", attendance: 89 },
    ],
  };

  const data = subjectData[selectedSubject];

  return (
    <div className="trend-section">
      <div className="trend-header">
        <div>
          <h3>Attendance Trend</h3>
          <span className="trend-subtitle">
            Last 7 Days (%) - {selectedSubject}
          </span>
        </div>

        <select
          className="subject-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {Object.keys(subjectData).map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
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