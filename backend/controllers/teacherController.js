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

// Time table upload 

const xlsx = require("xlsx");
const Timetable = require("../models/Timetable");

exports.uploadTimetable = async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    function excelTimeToString(time) {
      if (typeof time === "number") {
        const totalMinutes = Math.round(time * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      }
      return time;
    }

    // clear old data
    await Timetable.deleteMany({});

    for (let row of data) {
      if (!row.Day || !row.StartTime || !row.EndTime || !row.Subject || !row.Class) {
        continue;
      }

      await Timetable.create({
        day: row.Day,
        startTime: excelTimeToString(row.StartTime),
        endTime: excelTimeToString(row.EndTime),
        subject: row.Subject,
        class: row.Class,
      });
    }

    res.json({ message: "Timetable uploaded successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Auto QR 

exports.getAutoQR = async (req, res) => {
  try {
    const now = new Date();

    const day = now.toLocaleString("en-US", { weekday: "long" });
    const currentTime = now.toTimeString().slice(0, 5);

    const lecture = await Timetable.findOne({
      day: day,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
    });

    if (!lecture) {
      return res.json({ message: "No lecture right now" });
    }

    const qrPayload = {
      subject: lecture.subject,
      className: lecture.class,
      time: Date.now(),
    };

    const qrString = JSON.stringify(qrPayload);

    const qrImage = await QRCode.toDataURL(qrString);

    const expiresAt = new Date(Date.now() + 20 * 1000);

    await QR.create({
      teacher: req.user.id,
      subject: lecture.subject,
      className: lecture.class,
      qrData: qrString,
      expiresAt,
    });

    res.json({
      subject: lecture.subject,
      class: lecture.class,
      qrImage,
      expiresAt,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};