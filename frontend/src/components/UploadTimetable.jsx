import { useState, useEffect } from "react";
import "./uploadTimetable.css";

export default function UploadTimetable({ setRefreshQR }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  useEffect(() => {
    fetchFileName();
  }, []);

  const fetchFileName = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/teacher/timetable-file`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setUploadedFileName(data.fileName);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/teacher/upload-timetable`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setUploadedFileName(data.fileName);
        localStorage.setItem("timetableFile", data.fileName);

        setRefreshQR((prev) => !prev);

        setFile(null); // reset file
        document.querySelector("input[type=file]").value = "";
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/teacher/timetable`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setUploadedFileName("");
        localStorage.removeItem("timetableFile");
        setRefreshQR((prev) => !prev);
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload Timetable</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="upload-input"
      />

      <div className="upload-buttons">
        <button
          onClick={handleUpload}
          disabled={loading}
          className="upload-btn"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="delete-btn"
        >
          Remove Timetable
        </button>
      </div>

      {uploadedFileName ? (
        <p className="file-info uploaded">Uploaded: {uploadedFileName}</p>
      ) : (
        <p className="file-info no-file">No file uploaded</p>
      )}
    </div>
  );
}