const express = require("express");
const router = express.Router();
const { generateQR, getMyAttendance } = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Only teachers can access
router.post("/generate-qr", protect, authorize("teacher"), generateQR);
router.get("/my-attendance", protect, authorize("teacher"), getMyAttendance);

module.exports = router;
