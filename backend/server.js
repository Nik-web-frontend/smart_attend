const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");



dotenv.config();


const app = express();

app.use(cors({
  // origin: "http://localhost:3000",
  origin: true,
  credentials: true
}));

app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);

app.use("/api/teacher", require("./routes/teacherRoutes"));

app.use("/api/student", studentRoutes);

console.log("Student routes loaded");



app.get("/", (req, res) => {
  res.send("Backend is running, yeah it's working");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

