const express = require("express");
const router = express.Router();
const { scanQR, getRecentSession, getStudentAttendanceHistory, getNextLecture, getSubjectAnalytics} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

console.log("studentRoutes file loaded");


// Only students can scan QR
router.post("/scan-qr", protect, authorize("student"), scanQR);
// router.get("/attendance-stats", protect, authorize("student"), getAttendanceStats);
router.get("/recent-session", protect, authorize("student"), getRecentSession);
router.get("/attendance-history", protect, authorize("student"), getStudentAttendanceHistory);
router.get("/next-lecture", protect, authorize("student"), getNextLecture)
router.get("/subject-analytics", protect, authorize("student"), getSubjectAnalytics);


module.exports = router;
