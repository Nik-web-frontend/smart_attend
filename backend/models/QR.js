const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  className: {
    type: String,
    required: true,
  },
  qrData: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});



// module.exports = mongoose.model("QR", qrSchema);
module.exports =
  mongoose.models.QR ||
  mongoose.model("QR", qrSchema);
