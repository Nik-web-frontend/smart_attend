import { useState } from "react";

export default function UploadTimetable() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teacher/upload-timetable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    console.log(data);
    alert(data.message);
  };

  return (
    <div>
      <h2>Upload Timetable</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}