const QRCode = require("qrcode");
const mongoose = require("mongoose");
const QR = require("../models/QR");
const Attendance = require("../models/Attendance");
const XLSX = require("xlsx");
const User = require("../models/User");
const Timetable = require("../models/Timetable");

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

    const expiresAt = new Date(Date.now() + expiryMinutes * 60000);
    const today = new Date().toISOString().split("T")[0];

    // 🔥 Create session
    await QR.create({
      teacher: req.user.id,
      subject,
      className,
      date: today,
      expiresAt,
      qrData: "session",
    });

    res.json({
      message: "QR session started",
      expiresAt,
    });

  } catch (error) {
    console.error("Generate QR error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getManualQR = async (req, res) => {
  try {
    const now = new Date();

    // 1️⃣ Find latest active session
    const session = await QR.findOne({
      teacher: req.user.id,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.json({ message: "No active QR session" });
    }

    // 2️⃣ Expired
    if (now > session.expiresAt) {
      return res.json({
        message: "QR expired",
        subject: session.subject,
        class: session.className,
      });
    }

    // 3️⃣ Generate NEW QR every time
    const qrPayload = {
      subject: session.subject,
      className: session.className,
      time: Date.now(), // 🔥 THIS MAKES OLD QR INVALID
    };

    const qrString = JSON.stringify(qrPayload);
    const qrImage = await QRCode.toDataURL(qrString);

    // 4️⃣ Save QR
    await QR.create({
      teacher: req.user.id,
      subject: session.subject,
      className: session.className,
      date: session.date,
      expiresAt: session.expiresAt,
      qrData: qrString,
    });

    res.json({
      subject: session.subject,
      class: session.className,
      qrImage,
      expiresAt: session.expiresAt,
    });

  } catch (err) {
    console.error("Manual QR Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// Get My Attendance (Teacher)
// ======================

exports.getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("student", "fullName enrollmentNo")
      .sort({ createdAt: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getMyAttendance = async (req, res) => {
//   try {
//     const attendance = await Attendance.find()
//       .populate("student", "fullName enrollmentNo")
//       .populate("qr", "className subject");

//     res.status(200).json(attendance);
//   } catch (error) {
//     console.error("Get attendance error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// Time table upload 
const xlsx = require("xlsx");
const fs = require("fs");


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
    // ✅ Get correct IST time regardless of server timezone
    const istTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = istTime.toLocaleString("en-US", { weekday: "long" });
    const currentTime = istTime.toTimeString().slice(0, 5);

    console.log("Current Day:", day, "Current Time:", currentTime);
    console.log("USER ROLE:", req.user.role, "ALLOWED ROLES:", ["teacher"]);

    // 1️⃣ Find current lecture
    const lecture = await Timetable.findOne({
      day,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
    });

    // 2️⃣ Find next lecture
    // 2️⃣ Find next lecture (same day)
    let nextLecture = await Timetable.findOne({
      day,
      startTime: { $gt: currentTime },
    }).sort({ startTime: 1 });

    // 🔥 If no lecture left today → find first lecture of next day
    if (!nextLecture) {
      const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayIndex = daysOrder.indexOf(day);

      for (let i = 1; i <= 7; i++) {
        const nextDay = daysOrder[(todayIndex + i) % 7];

        const lecture = await Timetable.findOne({ day: nextDay }).sort({ startTime: 1 });

        if (lecture) {
          nextLecture = lecture;
          break;
        }
      }
    }
    // 3️⃣ No lecture right now
    if (!lecture) {
      return res.json({
        message: "No lecture right now",
        nextLecture,
      });
    }

    // 4️⃣ Lecture start time
    const [hours, minutes] = lecture.startTime.split(":").map(Number);
    const lectureStart = new Date(istTime);
    lectureStart.setHours(hours, minutes, 0, 0);

    // 5️⃣ QR expires 2 min from lecture start
    // const expiresAt = new Date(lectureStart.getTime() + 2 * 60 * 1000);

    const expiresAt = new Date(istTime.getTime() + 2 * 60 * 1000);

    // 6️⃣ If QR already expired
    if (istTime > expiresAt) {
      return res.json({
        message: "QR expired",
        subject: lecture.subject,
        class: lecture.class,
        nextLecture,
      });
    }


    // 8️⃣ Generate QR
    const qrPayload = {
      subject: lecture.subject,
      className: lecture.class,
      time: Date.now(),
    };
    const qrString = JSON.stringify(qrPayload);
    const qrImage = await QRCode.toDataURL(qrString);

    // 9️⃣ Save QR to DB (include date field)
    const today = istTime.toISOString().split("T")[0]; // YYYY-MM-DD
    await QR.create({
      teacher: req.user.id,
      subject: lecture.subject,
      className: lecture.class,
      qrData: qrString,
      expiresAt,
      date: today,
    });

    // 🔟 Send response
    res.json({
      subject: lecture.subject,
      class: lecture.class,
      qrImage,
      expiresAt,
      nextLecture,
    });

  } catch (err) {
    console.error("AutoQR Error:", err);
    res.status(500).json({ error: err.message });
  }
};

//Manual Attendance File Upload

exports.uploadAttendance = async (req, res) => {
  try {
    const { className, subject, date } = req.body;

    if (!className || !subject || !date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // 🔴 Remove old manual attendance for this session
    await Attendance.deleteMany({
      className,
      subject,
      date,
      source: "manual",
    });

    for (let row of data) {
      const student = await User.findOne({
        enrollmentNo: row.studentId,
      });

      if (!student) continue;

      // 🔴 Check if QR already marked
      const exists = await Attendance.findOne({
        student: student._id,
        className,
        subject,
        date,
      });

      if (exists && exists.source === "qr") {
        continue; // QR wins
      }

      await Attendance.create({
        student: student._id,
        className,
        subject,
        date,
        status: row.status === "Present" ? "Present" : "Absent",
        source: "manual",
      });
    }

    res.json({ message: "Attendance uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};


exports.getNextLecture = async (req, res) => {
  try {
    const istTime = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const day = istTime.toLocaleString("en-US", { weekday: "long" });
    const currentTime = istTime.toTimeString().slice(0, 5);

    // 1️⃣ Next lecture today
    let nextLecture = await Timetable.findOne({
      day,
      startTime: { $gt: currentTime },
    }).sort({ startTime: 1 });

    // 2️⃣ If not today → find next available day
    if (!nextLecture) {
      const daysOrder = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
      ];

      const todayIndex = daysOrder.indexOf(day);

      for (let i = 1; i <= 7; i++) {
        const nextDay = daysOrder[(todayIndex + i) % 7];

        const lecture = await Timetable.findOne({ day: nextDay })
          .sort({ startTime: 1 });

        if (lecture) {
          nextLecture = lecture;
          break;
        }
      }
    }

    // 3️⃣ No timetable uploaded
    if (!nextLecture) {
      return res.json({ message: "No timetable uploaded" });
    }

    res.json({
      subject: nextLecture.subject,
      class: nextLecture.class,
      startTime: nextLecture.startTime,
      day: nextLecture.day,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRecentSessions = async (req, res) => {
  try {
    const istTime = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const day = istTime.toLocaleString("en-US", { weekday: "long" });
    const currentTime = istTime.toTimeString().slice(0, 5);

    // 1️⃣ Get all lectures of today
    const lectures = await Timetable.find({ day }).sort({ startTime: 1 });

    if (!lectures || lectures.length === 0) {
      return res.json({ message: "No timetable uploaded", sessions: [] });
    }

    const sessions = lectures.map((lec) => {
      let status = "Pending";

      if (lec.endTime < currentTime) {
        status = "Completed";
      } else if (
        lec.startTime <= currentTime &&
        lec.endTime >= currentTime
      ) {
        status = "Live";
      }

      return {
        subject: lec.subject,
        className: lec.class,
        date: day,
        status,
      };
    });

    // 🔥 show only past + current (limit last 5)
    const filtered = sessions
      .filter((s) => s.status === "Completed" || s.status === "Live")
      .slice(-5);

    res.json({ sessions: filtered });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};





// GET /api/teacher/attendance-trend
exports.getAttendanceTrend = async (req, res) => {
  try {
    const { subject, className } = req.query;

    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }

    // 🔥 MATCH FILTER
    const matchStage = {
      date: { $in: last7Days },
      status: "Present",
    };

    if (subject && subject !== "All") {
      matchStage.subject = subject;
    }

    if (className && className !== "All") {
      matchStage.className = className;
    }

    // 🔥 GET TOTAL STUDENTS
    let totalStudents = 0;

    if (className && className !== "All") {
      totalStudents = await User.countDocuments({
        role: "student",
        className: className,
      });
    } else {
      totalStudents = await User.countDocuments({
        role: "student",
      });
    }

    // 🔴 IMPORTANT: avoid divide by 0
    if (totalStudents === 0) totalStudents = 1;

    // 🔥 AGGREGATION (UNIQUE STUDENTS PER DAY)
    const data = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: "$date",
            student: "$student", // 🔥 UNIQUE student
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          presentStudents: { $sum: 1 },
        },
      },
    ]);

    // 🔥 FORMAT RESPONSE
    const result = last7Days.map((date) => {
      const record = data.find((d) => d._id === date);

      const present = record ? record.presentStudents : 0;

      const percentage = Math.round((present / totalStudents) * 100);

      const dayName = new Date(date).toLocaleString("en-US", {
        weekday: "short",
      });

      return {
        day: dayName,
        attendance: percentage,
      };
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/teacher/classes
exports.getClasses = async (req, res) => {
  try {
    const classes = await Attendance.distinct("className");
    res.json({ classes: ["All", ...classes] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/teacher/subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Attendance.distinct("subject");

    res.json({
      subjects: ["All", ...subjects],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};