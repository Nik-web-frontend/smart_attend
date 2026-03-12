import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import "../css/register.css";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    enrollmentNo: "",
    className: "",
    department: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await registerUser(formData);
      console.log("REGISTER SUCCESS →", data);

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (error) {
      console.error(
        error.response?.data?.message || "Registration failed"
      );
      alert(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="register-title">Register</h2>

        <form onSubmit={handleSubmit} className="register-form">

          <input
            className="form-input"
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            className="form-input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="password-wrapper">
            <input
              className="form-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <select
            className="form-input"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          {/* STUDENT FIELDS */}
          {formData.role === "student" && (
            <>
              <input
                className="form-input"
                type="text"
                name="enrollmentNo"
                placeholder="Enrollment Number"
                value={formData.enrollmentNo}
                onChange={handleChange}
                required
              />

              <select
                className="form-input"
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
            </>
          )}

          {/* TEACHER FIELD */}
          {formData.role === "teacher" && (
            <input
              className="form-input"
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" className="submit-btn">
            Register
          </button>

          <p style={{ marginTop: "0px" }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Register;