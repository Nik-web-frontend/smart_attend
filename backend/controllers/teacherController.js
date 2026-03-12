const QRCode = require("qrcode");
const mongoose = require("mongoose");
const QR = require("../models/QR");
const Attendance = require("../models/Attendance");

// ======================
// Generate QR
// ======================
exports.generateQR = async (req, res) => {
  try {
    const { subject, expiryMinutes, className } = req.body;

    if (!subject || !expiryMinutes || !className) {
      return res.status(400).json({
        message: "Subject, class name and expiry time are required",
      });
    }

    const expiryTime = new Date(Date.now() + expiryMinutes * 60000);

    // QR payload
    const qrData = JSON.stringify({
      teacherId: req.user.id,
      subject,
      className,
      expiresAt: expiryTime,
    });

    // Generate QR image
    const qrImage = await QRCode.toDataURL(qrData);

    // Save to DB
    const qrDoc = await QR.create({
      teacher: req.user.id,
      subject,
      className,
      expiresAt: expiryTime,
      qrData,
    });

    res.status(201).json({
      message: "QR generated successfully",
      qr: qrImage,
      qrDoc,
    });
  } catch (error) {
    console.error("Generate QR error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// Get My Attendance (Teacher)
// ======================
exports.getMyAttendance = async (req, res) => {
  try {
    // Step 1: Find all QR IDs created by this teacher
    const teacherQRs = await QR.find({ teacher: req.user.id }).select("_id");

    // Step 2: Fetch attendance for these QR IDs only
    const attendance = await Attendance.find({
      qr: { $in: teacherQRs.map(q => q._id) },
    })
      .populate("student", "fullName enrollmentNo")
      .populate("qr", "className subject");

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
};