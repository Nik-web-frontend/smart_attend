import { useEffect, useState } from "react";
import "./autoQR.css";

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

      // if (data.expiresAt) {
      //   const diff = Math.floor(
      //     (new Date(data.expiresAt) - new Date()) / 1000
      //   );
      //   setTimeLeft(diff > 0 ? diff : 0);
      // }

      if (data.timeLeft !== undefined) {
        setTimeLeft(data.timeLeft > 0 ? data.timeLeft : 0);
      }

      if (data.message === "QR expired") {
        setTimeLeft(0);
      }

    } catch (err) {
      console.error("Error fetching QR:", err);
    }
  };

  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 10000);
    return () => clearInterval(interval);
  }, [refreshQR]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="autoqr-container">
      <h2 className="autoqr-title">Live QR</h2>

      {/* Expired */}
      {qr?.message === "QR expired" ? (
        <p className="qr-expired">
          QR Expired for <strong>{qr.subject}</strong>
        </p>

      ) : qr?.qrImage ? (

        /* Active */
        <div className="qr-active">
          <img src={qr.qrImage} alt="QR Code" className="qr-image" />

          <div className="qr-info">
            <h3>Subject: {qr.subject}</h3>
            <h3>Class: {qr.class}</h3>
            <p className="qr-timer">Expires in: {timeLeft}s</p>
          </div>
        </div>

      ) : (

        /* No lecture */
        <p className="qr-no-lecture">No lecture right now</p>
      )}

      {/* Upcoming lecture */}
      {qr?.nextLecture && (
        <div className="upcoming-lecture">
          <h3>Upcoming Lecture</h3>
          <p><strong>Subject:</strong> {qr.nextLecture.subject}</p>
          <p><strong>Class:</strong> {qr.nextLecture.class}</p>
          <p><strong>Time:</strong> {qr.nextLecture.startTime} - {qr.nextLecture.endTime}</p>
        </div>
      )}
    </div>
  );
}