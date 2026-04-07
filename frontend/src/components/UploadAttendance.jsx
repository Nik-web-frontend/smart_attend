import { useState } from "react";
import FacultyNavbar from "./FacultyNavbar";
import "./uploadAttendance.css";

export default function UploadAttendance() {
    const [file, setFile] = useState(null);
    const [className, setClassName] = useState("");
    const [subject, setSubject] = useState("");
    const [date, setDate] = useState("");

    const handleUpload = async () => {
        const token = localStorage.getItem("token");

        if (!file || !className || !subject || !date) {
            return alert("All fields required");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("className", className);
        formData.append("subject", subject);
        formData.append("date", date);

        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teacher/upload-attendance`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`, 
            },
            body: formData,
        });

        const data = await res.json();
        alert(data.message);
    };

    return (
        <>
            <FacultyNavbar />

            <div className="upload-attendance-container">
                <h2 className="upload-attendance-title">Upload Attendance</h2>

                <div className="upload-attendance-form">
                    {/* Dropdown for Class */}
                    <select
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Select Class</option>
                        <option value="7A">7A</option>
                        <option value="7B">7B</option>
                        <option value="8A">8A</option>
                        <option value="8B">8B</option>
                        <option value="9A">9A</option>
                    </select>

                    {/* Dropdown for Subject */}
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Select Subject</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Gujarati">Gujarati</option>
                        <option value="Maths">Maths</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                    </select>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input-field"
                    />

                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="input-file"
                    />

                    <button onClick={handleUpload} className="upload-button">
                        Upload
                    </button>
                </div>
            </div>
        </>
    );
}