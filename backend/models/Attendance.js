const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    qr: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "QR", 
      required: true 
    },
    scannedAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same session
attendanceSchema.index({ student: 1, qr: 1 }, { unique: true });

// module.exports = mongoose.model("Attendance", attendanceSchema);
module.exports =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);