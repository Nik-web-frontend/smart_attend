const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    className: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    date: {
      type: String, // you can later convert to Date type if needed
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },

    source: {
      type: String,
      enum: ["qr", "manual"],
      default: "manual",
    },

    // Only for QR attendance
    qr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QR",
    },

    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate attendance (VERY IMPORTANT)
attendanceSchema.index(
  { student: 1, className: 1, subject: 1, date: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);