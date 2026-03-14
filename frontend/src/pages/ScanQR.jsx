import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import StudentNavbar from "../components/StudentNavbar";

const ScanQR = () => {
  const [message, setMessage] = useState("");
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            if (!isScanning.current) return;

            isScanning.current = false;
            await scanner.stop();

            try {
              const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/student/scan-qr`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ qrData: decodedText }),
                }
              );

              const data = await response.json();
              setMessage(data.message || "Attendance Marked");
            } catch (error) {
              setMessage("Error submitting attendance");
            }
          }
        );

        isScanning.current = true;
      } catch (err) {
        console.error("Scanner failed:", err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [token]);

  const scanAgain = () => {
    window.location.reload();
  };

  return (
    <>
    <StudentNavbar/>
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf7)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          Scan Attendance QR
        </h2>

        <div
          id="reader"
          style={{
            width: "100%",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        ></div>

        {message && (
          <>
            <p
              style={{
                marginTop: "10px",
                fontSize: "15px",
                fontWeight: "500",
                color: message.toLowerCase().includes("error")
                  ? "#e53935"
                  : "#2e7d32",
              }}
            >
              {message}
            </p>

            <button
              onClick={scanAgain}
              style={{
                marginTop: "18px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#1976d2",
                color: "#fff",
                fontWeight: "500",
                cursor: "pointer",
                transition: "0.2s ease",
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = "#1565c0")
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = "#1976d2")
              }
            >
              Scan Again
            </button>
          </>
        )}
      </div>
    </div>
        </>

  );
};

export default ScanQR;