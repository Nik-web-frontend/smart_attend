import { useEffect, useState } from "react";

export default function AutoQR({ refreshQR }) {
  const [qr, setQr] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchQR = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/teacher/auto-qr`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setQr(data);

      // ✅ handle expiry time
      if (data.expiresAt) {
        const diff = Math.floor(
          (new Date(data.expiresAt) - new Date()) / 1000
        );
        setTimeLeft(diff > 0 ? diff : 0);
      }

      // ✅ handle expired case
      if (data.message === "QR expired") {
        setTimeLeft(0);
      }

    } catch (err) {
      console.error("Error fetching QR:", err);
    }
  };

  // Fetch every 10 sec
  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 10000);
    return () => clearInterval(interval);
  }, [refreshQR]);

  // ⏳ Countdown (STOP when 0)
  useEffect(() => {
    if (timeLeft <= 0) return; // stop timer when expired

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div>
      <h2>Live QR</h2>

      {/* 1. Expired */}
      {qr?.message === "QR expired" ? (
        <p style={{ color: "red" }}>
          QR Expired for {qr.subject}
        </p>

      ) : qr?.qrImage ? (

        /* 2. Active */
        <div>
          <img src={qr.qrImage} alt="QR Code" />

          <h3>Subject: {qr.subject}</h3>
          <h3>Class: {qr.class}</h3>

          <p>Expires in: {timeLeft}s</p>
        </div>

      ) : (

        /* 3. No lecture */
        <p>No lecture right now</p>
      )}

      {/* Upcoming lecture ALWAYS */}
      {qr?.nextLecture && (
        <div style={{ marginTop: "20px" }}>
          <h3>Upcoming Lecture</h3>
          <p>Subject: {qr.nextLecture.subject}</p>
          <p>Class: {qr.nextLecture.class}</p>
          <p>
            Time: {qr.nextLecture.startTime} -{" "}
            {qr.nextLecture.endTime}
          </p>
        </div>
      )}
    </div>
  );
}