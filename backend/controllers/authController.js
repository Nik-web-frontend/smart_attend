const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ============================
// REGISTER
// ============================
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      enrollmentNo,
      className,
      department,
    } = req.body;

    // 1️⃣ Basic validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }


    const passwordRegex = /^(?=.*\d).{6,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and contain at least one digit"
      });
    }

    // 2️⃣ Role-based validation
    if (role === "student") {
      if (!enrollmentNo || !className) {
        return res.status(400).json({
          message: "Enrollment number and class are required for students",
        });
      }
    }

    if (role === "teacher") {
      if (!department) {
        return res.status(400).json({
          message: "Department is required for teachers",
        });
      }
    }

    // 3️⃣ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    // 4️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5️⃣ Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      enrollmentNo: role === "student" ? enrollmentNo : undefined,
      className: role === "student" ? className : undefined,
      department: role === "teacher" ? department : undefined,
    });

    // 6️⃣ Response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        enrollmentNo: user, enrollmentNo,
        className: user.className || null,
      },
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};



// ============================
// LOGIN
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Generate JWT (IMPORTANT: include className)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        className: user.className || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5️⃣ Response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        enrollmentNo: user.enrollmentNo,
        className: user.className || null,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};