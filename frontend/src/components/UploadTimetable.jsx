import { useState, useEffect } from "react";

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

        setFile(null); // 🔥 reset file
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
        setRefreshQR((prev) => !prev); // 🔥 refresh QR UI
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
    <div>
      <h2>Upload Timetable</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      <button onClick={handleDelete} disabled={loading}>
        Remove Timetable
      </button>
      {uploadedFileName ? (
        <p style={{ color: "green" }}>
          Uploaded: {uploadedFileName}
        </p>
      ) : (
        <p style={{ color: "gray" }}>
          No file uploaded
        </p>
      )}
    </div>
  );
}