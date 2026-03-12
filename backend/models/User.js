const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
    },

    enrollmentNo: {
      type: Number,
      unique: true,
      required: function () {
        return this.role === "student";
      },
    },

    className: {
      type: String,
      enum: ["7A", "7B", "8A", "8B", "9A", "9B"],
      required: function () {
        return this.role === "student";
      },
    },

    department: {
      type: String,
      required: function () {
        return this.role === "teacher";
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
