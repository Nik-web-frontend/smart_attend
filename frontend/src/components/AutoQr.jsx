import { useEffect, useState } from "react";

export default function AutoQR() {
  const [qr, setQr] = useState(null);

  const fetchQR = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/teacher/auto-qr`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setQr(data);
  };

  useEffect(() => {
    fetchQR(); // first call

    const interval = setInterval(fetchQR, 20000); // every 20 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Live QR</h2>

      {qr?.qrImage ? (
        <img src={qr.qrImage} alt="QR Code" />
      ) : (
        <p>No lecture right now</p>
      )}
    </div>
  );
}