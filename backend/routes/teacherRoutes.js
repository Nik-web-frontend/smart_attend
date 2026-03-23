const express = require("express");
const router = express.Router();
const { generateQR, getMyAttendance } = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");
const { uploadTimetable } = require("../controllers/teacherController");

const { getAutoQR } = require("../controllers/teacherController");

// Only teachers can access
router.post("/generate-qr", protect, authorize("teacher"), generateQR);
router.get("/my-attendance", protect, authorize("teacher"), getMyAttendance);
router.post("/upload-timetable", upload.single("file"), uploadTimetable);
router.get("/auto-qr", protect, authorize("teacher"), getAutoQR);

module.exports = router;
