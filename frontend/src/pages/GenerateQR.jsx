import { useState } from "react";
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

  const [qrImage, setQrImage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setQrImage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/teacher/generate-qr`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQrImage(response.data.qr);
      setMessage("QR Code generated successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error generating QR");
    }

    setLoading(false);
  };

  return (
    <>
      <FacultyNavbar />
      <div className="qr-page">
        {/* LEFT SIDE - FORM */}
        <div className="qr-form-card">
          <h2>Generate Attendance QR</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            

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
                <option value="9B">9B</option>
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
              {loading ? "Generating..." : "Generate QR"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE - RESULT */}
        <div className="qr-result-card">
          {!qrImage && <p className="placeholder">QR will appear here</p>}

          {qrImage && (
            <>
              <h3 className="success">QR Generated Successfully</h3>

              <div className="session-info">
                <p><strong>Subject:</strong> {formData.subject}</p>
                <p><strong>Class:</strong> {formData.className}</p>
                <p><strong>Expires In:</strong> {formData.expiryMinutes} min</p>
              </div>

              <img src={qrImage} alt="QR Code" />
            </>
          )}

          {message && !qrImage && <p className="error">{message}</p>}
        </div>
      </div>
    </>
  );
};

export default GenerateQR;