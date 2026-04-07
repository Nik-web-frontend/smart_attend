const QR = require("../models/QR");
const Attendance = require("../models/Attendance");
const Timetable = require("../models/Timetable")
exports.scanQR = async (req, res) => {
  try {
    // Safety check
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can mark attendance" });
    }

    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: "QR data is required" });
    }

    // Find QR
    const qr = await QR.findOne({ qrData });

    if (!qr) {
      return res.status(404).json({ message: "QR not found" });
    }

    const parsedQR = JSON.parse(qrData);

    // 🔥 10-second validation (ANTI-SHARE)
    const now = Date.now();
    const qrTime = parsedQR.time;

    if (now - qrTime > 10000) {
      return res.status(400).json({
        message: "QR expired. Scan latest QR",
      });
    }

    // Expiration check
    if (new Date() > qr.expiresAt) {
      return res.status(400).json({ message: "QR expired" });
    }

    // Class validation
    if (req.user.className !== qr.className) {
      return res.status(403).json({ message: "Not allowed for this class" });
    }

    // Check duplicate manually (safer during development)
    const existing = await Attendance.findOne({
      student: req.user._id,
      qr: qr._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // Create attendance
    await Attendance.create({
      student: req.user._id,
      className: qr.className,
      subject: qr.subject,
      date: qr.date, // IMPORTANT (see below)
      status: "Present",
      source: "qr",
      qr: qr._id,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
    });

  } catch (error) {
    console.error("Scan QR Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getAttendanceStats = async (req, res) => {
  try {
    const studentClass = req.user.className;
    const studentId = req.user._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1️⃣ Get all QR sessions created today for this class
    // const todaysQRs = await QR.find({
    //   className: studentClass,
    //   createdAt: { $gte: todayStart, $lte: todayEnd }
    // });

    const todaysQRs = await QR.find({
      className: studentClass,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    }).sort({ createdAt: -1 });

    const totalLecturesToday = todaysQRs.length;

    // 2️⃣ Get all attendance records of this student today
    const todaysAttendance = await Attendance.find({
      student: studentId,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const todayAttend = todaysAttendance.length;

    // 3️⃣ Total attendance overall
    const totalAttend = await Attendance.countDocuments({
      student: studentId
    });

    // 4️⃣ Map today's sessions with attendance status
    const todaysSessions = todaysQRs.map(qr => {
      const attended = todaysAttendance.some(
        att => att.qr.toString() === qr._id.toString()
      );

      return {
        _id: qr._id,
        subject: qr.subject,
        className: qr.className,
        date: qr.createdAt,
        attended
      };
    });

    res.status(200).json({
      totalLecturesToday,
      totalAttend,
      todayAttend,
      todaysSessions
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Recent session for student
exports.getRecentSession = async (req, res) => {
  try {
    const studentId = req.user._id;
    const studentClass = req.user.className;

    // ✅ Today range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1️⃣ Get today's QR codes
    const todaysQRs = await QR.find({
      className: studentClass,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    if (!todaysQRs.length) {
      return res.json({
        message: "No sessions today",
        sessions: [],
        totalLecturesToday: 0,
        todayAttend: 0,
      });
    }

    // 2️⃣ Get attendance records
    const attendance = await Attendance.find({
      student: studentId,
      qr: { $in: todaysQRs.map((q) => q._id) },
    });

    // 3️⃣ Create set of attended QR IDs
    const attendedSet = new Set(
      attendance.map((a) => a.qr?.toString())
    );

    // 4️⃣ GROUP sessions (🔥 FIXED: 1 HOUR BUCKET)
    const sessionMap = new Map();

    todaysQRs.forEach((qr) => {
      const time = new Date(qr.createdAt).getTime();

      // 🔥 FIX: 1 hour bucket instead of 5 min
      const bucket = Math.floor(time / (60 * 60 * 1000));

      const key = `${qr.subject}_${qr.className}_${bucket}`;

      // create session if not exists
      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          _id: qr._id,
          subject: qr.subject,
          className: qr.className,
          date: qr.createdAt,
          attended: false,
        });
      }

      // 🔥 IMPORTANT: if ANY QR attended → mark session attended
      if (attendedSet.has(qr._id.toString())) {
        sessionMap.get(key).attended = true;
      }
    });

    const sessions = Array.from(sessionMap.values());

    res.json({
      totalLecturesToday: sessions.length,
      todayAttend: sessions.filter((s) => s.attended).length,
      sessions,
    });

  } catch (error) {
    console.error("Get recent session error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentAttendanceHistory = async (req, res) => {
  try {
    const studentId = req.user._id;
    const studentClass = req.user.className;

    // 1️⃣ Get all attendance (QR + Manual)
    const attendance = await Attendance.find({
      student: studentId,
      className: studentClass,
    }).sort({ createdAt: -1 });

    // 2️⃣ Group into sessions (5 min bucket)
    const sessionMap = new Map();

    attendance.forEach((att) => {
      const time = new Date(att.createdAt).getTime();
      const bucket = Math.floor(time / (5 * 60 * 1000));

      const key = `${att.subject}_${att.className}_${bucket}`;

      // 🔥 If not exists → create
      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          _id: att._id,
          subject: att.subject,
          className: att.className,
          date: att.createdAt,
          status: att.status, // Present / Absent
        });
      } else {
        // 🔥 If multiple records → prioritize "Present"
        if (att.status === "Present") {
          sessionMap.get(key).status = "Present";
        }
      }
    });

    const result = Array.from(sessionMap.values());

    res.status(200).json(result);

  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// const Timetable = require("../models/Timetable");
const User = require("../models/User");

exports.getNextLecture = async (req, res) => {
  try {
    // 1. Get logged-in student
    const student = await User.findById(req.user.id);

    if (!student || student.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Student only.",
      });
    }

    const studentClass = student.className;

    // 2. Current day & time
    const now = new Date();

    const dayOrder = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const currentDay = dayOrder[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    const todayIndex = dayOrder.indexOf(currentDay);

    // 3. Fetch all timetable for that class
    const timetable = await Timetable.find({ class: studentClass });

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No timetable found for this class",
      });
    }

    // 4. Filter only upcoming lectures (today + future days)
    const upcomingLectures = timetable
      .map((lec) => {
        const lecDayIndex = dayOrder.indexOf(lec.day);

        // Calculate distance from today
        let dayDiff = (lecDayIndex - todayIndex + 7) % 7;

        return {
          ...lec._doc,
          dayDiff,
        };
      })
      .filter((lec) => {
        // If today → only future time
        if (lec.dayDiff === 0) {
          return lec.startTime >= currentTime;
        }
        return true;
      });

    // 5. If no upcoming today → fallback (next available in week)
    if (upcomingLectures.length === 0) {
      const allSorted = timetable
        .map((lec) => {
          const lecDayIndex = dayOrder.indexOf(lec.day);
          let dayDiff = (lecDayIndex - todayIndex + 7) % 7;

          return {
            ...lec._doc,
            dayDiff,
          };
        })
        .sort((a, b) => {
          if (a.dayDiff !== b.dayDiff) {
            return a.dayDiff - b.dayDiff;
          }
          return a.startTime.localeCompare(b.startTime);
        });

      return res.json({
        success: true,
        lecture: allSorted[0] || null,
      });
    }

    // 6. Sort upcoming lectures properly
    const sortedLectures = upcomingLectures.sort((a, b) => {
      if (a.dayDiff !== b.dayDiff) {
        return a.dayDiff - b.dayDiff;
      }
      return a.startTime.localeCompare(b.startTime);
    });

    // 7. Return next lecture
    return res.json({
      success: true,
      lecture: sortedLectures[0],
    });

  } catch (error) {
    console.error("Get Next Lecture Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching lecture",
    });
  }
};


// controllers/studentAnalyticsController.js


exports.getSubjectAnalytics = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const className = student.className;

    // ✅ 1. Get QR lectures
    const qrLectures = await QR.find({ className });

    // ✅ 2. Get manual attendance lectures (for total count)
    const manualLectures = await Attendance.find({
      className,
      source: "manual",
    });

    // ✅ 3. Create UNIQUE lecture set
    const lectureSet = new Set();

    // From QR
    qrLectures.forEach((lec) => {
      const key = `${lec.className}-${lec.subject}-${lec.date}`;
      lectureSet.add(key);
    });

    // From Manual
    manualLectures.forEach((lec) => {
      const key = `${lec.className}-${lec.subject}-${lec.date}`;
      lectureSet.add(key);
    });


    // ✅ 4. Total lectures per subject
    const totalMap = {};

    lectureSet.forEach((key) => {
      const parts = key.split("-");
      const subject = parts[1];

      if (!totalMap[subject]) {
        totalMap[subject] = 0;
      }

      totalMap[subject] += 1;
    });

    // ✅ 5. Present count (student specific)
    const studentAttendance = await Attendance.find({
      student: req.user.id,
      status: "Present",
    });

    const presentMap = {};

    studentAttendance.forEach((att) => {
      if (!presentMap[att.subject]) {
        presentMap[att.subject] = 0;
      }
      presentMap[att.subject] += 1;
    });

    // ✅ 6. Final data
    const graphData = Object.keys(totalMap).map((subject) => {
      const total = totalMap[subject];
      const present = presentMap[subject] || 0;

      return {
        subject,
        total,
        present,
        percentage: total === 0 ? 0 : Math.round((present / total) * 100),
      };
    });

    res.json({
      success: true,
      data: graphData,
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating analytics",
    });
  }
};
