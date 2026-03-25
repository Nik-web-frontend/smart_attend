const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  fileName: {
    type: String
  }
});

module.exports = mongoose.model("Timetable", timetableSchema);