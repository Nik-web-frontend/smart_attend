const express = require("express");
const router = express.Router();
const { generateQR, getManualQR, getNextLecture, getRecentSessions, getMyAttendance, getTimetableFile, uploadAttendance, getSubjects, getClasses } = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");
const { uploadTimetable, deleteTimetable } = require("../controllers/teacherController");

const { getAutoQR, getAttendanceTrend } = require("../controllers/teacherController");



// Only teachers can access
router.post("/generate-qr", protect, authorize("teacher"), generateQR);
router.get("/manual-qr", protect, authorize("teacher"), getManualQR);
router.get("/next-lecture", protect, authorize("teacher"), getNextLecture);
router.get("/recent-sessions", protect, authorize("teacher"), getRecentSessions);
router.get("/my-attendance", protect, authorize("teacher"), getMyAttendance);
router.get("/attendance-trend", protect, authorize("teacher"), getAttendanceTrend);
router.get("/subjects", protect, authorize("teacher"), getSubjects);
router.get("/classes", protect, authorize("teacher"), getClasses);
router.post("/upload-timetable", upload.single("file"), uploadTimetable);
router.get("/auto-qr", protect, authorize("teacher"), getAutoQR);
router.delete("/timetable", protect, authorize("teacher"), deleteTimetable);
router.get("/timetable-file", protect, authorize("teacher"), getTimetableFile);
router.post("/upload-attendance", protect, authorize("teacher"), upload.single("file"), uploadAttendance);

module.exports = router;
