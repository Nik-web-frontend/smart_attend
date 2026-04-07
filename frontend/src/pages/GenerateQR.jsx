import { useState, useEffect } from "react";
import FacultyNavbar from "../components/FacultyNavbar";
import axios from "axios";
import "./GenerateQR.css";

const GenerateQR = () => {
  const [formData, setFormData] = useState({
    subject: "",
    lectureNumber: "",
    className: "",
    expiryMinutes: "",
  });

  const [qr, setQr] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setQr(null);
    setLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/teacher/generate-qr`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("QR session started");
      fetchQR();

    } catch (error) {
      setMessage(error.response?.data?.message || "Error generating QR");
    }

    setLoading(false);
  };

  const fetchQR = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/teacher/manual-qr`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQr(res.data);

      if (res.data.expiresAt) {
        const diff = Math.floor((new Date(res.data.expiresAt) - new Date()) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);
      }

      if (res.data.message === "QR expired") setTimeLeft(0);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!qr) return;
    const interval = setInterval(fetchQR, 10000);
    return () => clearInterval(interval);
  }, [qr]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <>
      <FacultyNavbar />

      <div className="qr-page">
        {/* LEFT SIDE - FORM */}
        <div className="qr-form-card">
          <h2>Generate Attendance QR</h2>

          <form onSubmit={handleSubmit}>
            {/* 🔹 Subject Dropdown */}
            <div className="form-group">
              <label>Subject</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select Subject</option>
                <option value="Hindi">Hindi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Maths">Maths</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* 🔹 Class Dropdown */}
            <div className="form-group">
              <label>Class</label>
              <select
                name="className"
                value={formData.className}
                onChange={handleChange}
                required
              >
                <option value="">Select Class</option>
                <option value="7A">7A</option>
                <option value="7B">7B</option>
                <option value="8A">8A</option>
                <option value="8B">8B</option>
                <option value="9A">9A</option>
              </select>
            </div>

            <div className="form-group">
              <label>Expiry Time (Minutes)</label>
              <input
                type="number"
                name="expiryMinutes"
                min="1"
                max="120"
                value={formData.expiryMinutes}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Starting..." : "Generate QR"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE - RESULT */}
        <div className="qr-result-card">
          {!qr && <p className="placeholder">QR will appear here</p>}

          {qr?.qrImage && (
            <>
              <h3 className="success">QR Active</h3>
              <div className="session-info">
                <p><strong>Subject:</strong> {qr.subject}</p>
                <p><strong>Class:</strong> {qr.class}</p>
                <p><strong>Expires In:</strong> {timeLeft}s</p>
              </div>
              <img src={qr.qrImage} alt="QR Code" />
            </>
          )}

          {qr?.message === "QR expired" && (
            <p className="error">QR Expired for {qr.subject}</p>
          )}

          {message && !qr && <p className="error">{message}</p>}
        </div>
      </div>
    </>
  );
};

export default GenerateQR;