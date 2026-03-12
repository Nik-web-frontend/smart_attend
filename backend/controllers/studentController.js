const QR = require("../models/QR");
const Attendance = require("../models/Attendance");

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

    // Find the most recent QR scanned or scheduled for student's class
    const recentQR = await QR.find({ className: req.user.className })
      .sort({ createdAt: -1 }) // latest first
      .limit(1);

    if (!recentQR.length) {
      return res.status(404).json({ message: "No recent session found" });
    }

    const qr = recentQR[0];

    // Check if student attended this QR
    const attendance = await Attendance.findOne({
      student: studentId,
      qr: qr._id,
    });

    res.status(200).json({
      subject: qr.subject,
      className: qr.className,
      date: qr.createdAt,
      attended: !!attendance,
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

    // 1️⃣ Get all QR sessions of this class
    const allSessions = await QR.find({ className: studentClass })
      .sort({ createdAt: -1 });

    // 2️⃣ Get all attendance records of this student
    const studentAttendance = await Attendance.find({
      student: studentId
    });

    // 3️⃣ Create a set of attended QR ids
    const attendedQRIds = new Set(
      studentAttendance.map(att => att.qr.toString())
    );

    // 4️⃣ Map sessions with status
    const attendanceHistory = allSessions.map(session => ({
      _id: session._id,
      subject: session.subject,
      className: session.className,
      date: session.createdAt,
      status: attendedQRIds.has(session._id.toString())
        ? "Present"
        : "Absent"
    }));

    res.status(200).json(attendanceHistory);

  } catch (error) {
    console.error("Attendance history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};