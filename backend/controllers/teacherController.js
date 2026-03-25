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
const fs = require("fs");
const Timetable = require("../models/Timetable");

exports.uploadTimetable = async (req, res) => {
  try {
    // ❌ No file uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

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

    // 🔥 clear old timetable (overwrite)
    await Timetable.deleteMany({});

    let insertedCount = 0;

    for (let row of data) {
      if (!row.Day || !row.StartTime || !row.EndTime || !row.Subject || !row.Class) {
        console.log("Skipping invalid row:", row);
        continue;
      }

      await Timetable.create({
        day: row.Day,
        startTime: excelTimeToString(row.StartTime),
        endTime: excelTimeToString(row.EndTime),
        subject: row.Subject,
        class: row.Class,
        fileName: req.file.originalname,
      });

      insertedCount++;
    }

    // 🔥 delete uploaded file (important)
    fs.unlinkSync(req.file.path);

    res.json({
      message: "Timetable uploaded successfully",
      count: insertedCount,
      fileName: req.file.originalname,
    });

  } catch (error) {
    console.error(error);

    // cleanup if error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: error.message });
  }
};

// GET /api/teacher/timetable-file
exports.getTimetableFile = async (req, res) => {
  const record = await Timetable.findOne();

  if (!record) {
    return res.json({ fileName: null });
  }

  res.json({ fileName: record.fileName });
};

// DELETE timetable
exports.deleteTimetable = async (req, res) => {
  try {
    await Timetable.deleteMany({});
    res.json({ message: "Timetable cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Auto QR 

exports.getAutoQR = async (req, res) => {
  try {
    const now = new Date();

    const day = now.toLocaleString("en-US", { weekday: "long" });
    const currentTime = now.toTimeString().slice(0, 5);

    // 1. Find current lecture
    const lecture = await Timetable.findOne({
      day: day,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
    });

    // 2. Find next lecture (ALWAYS)
    const nextLecture = await Timetable.findOne({
      day: day,
      startTime: { $gt: currentTime },
    }).sort({ startTime: 1 });

    // 3. No current lecture
    if (!lecture) {
      return res.json({
        message: "No lecture right now",
        nextLecture,
      });
    }

    // 4. Calculate lecture start time
    const [hours, minutes] = lecture.startTime.split(":").map(Number);

    const lectureStart = new Date();
    lectureStart.setHours(hours, minutes, 0, 0);

    // 5. Fixed expiry (2 min from lecture start)
    const expiresAt = new Date(lectureStart.getTime() + 2 * 60 * 1000);

    // 6. If expired
    if (new Date() > expiresAt) {
      return res.json({
        message: "QR expired",
        subject: lecture.subject,
        class: lecture.class,
        nextLecture,
      });
    }

    // 7. Cleanup old QRs
    await QR.deleteMany({ expiresAt: { $lt: new Date() } });

    // 8. Generate NEW QR every time
    const qrPayload = {
      subject: lecture.subject,
      className: lecture.class,
      time: Date.now(),
    };

    const qrString = JSON.stringify(qrPayload);
    const qrImage = await QRCode.toDataURL(qrString);

    // 9. Save QR
    await QR.create({
      teacher: req.user.id,
      subject: lecture.subject,
      className: lecture.class,
      qrData: qrString,
      expiresAt,
    });

    // 10. Response
    res.json({
      subject: lecture.subject,
      class: lecture.class,
      qrImage,
      expiresAt,
      nextLecture,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};