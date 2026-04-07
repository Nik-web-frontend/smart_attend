import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ResponsiveContainer
} from "recharts";
import "./analytical.css";

const Analytical = () => {
  const [data, setData] = useState([]);

  const fetchGraph = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/student/subject-analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data.data);
    } catch (err) {
      console.error("Graph error:", err);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const getColor = (percentage) => {
    if (percentage < 75) return "#ff4d4f";     
    if (percentage <= 90) return "#faad14";    
    return "#52c41a";                          
  };

  if (!data.length) {
    return <p className="no-data">No data available</p>;
  }

  return (
    <div className="analytical-container">
      <h3>Subject-wise Attendance</h3>

      <div className="chart-card">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 13 }} />
            <Tooltip
              formatter={(value, name, props) =>
                `${value}% (${props.payload.present}/${props.payload.total})`
              }
            />
            <Bar dataKey="percentage" radius={[5, 5, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="legend">
        <span style={{ color: "#ff4d4f" }}>● Low (&lt;75%)</span>
        <span style={{ color: "#faad14" }}>● Average (75–90%)</span>
        <span style={{ color: "#52c41a" }}>● High (&gt;90%)</span>
      </div>
    </div>
  );
};

export default Analytical;