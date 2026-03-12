import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import GenerateQR from "./pages/GenerateQR";
import ScanQR from "./pages/ScanQR";
import ViewAttendance from "./pages/ViewAttendance";
import ProtectedRoute from "./routes/ProtectedRoute";
import StudentAttendance from "./pages/StudentAttendance";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Role Redirect Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Dashboard */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Faculty Dashboard */}
        <Route
          path="/faculty-dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher Only */}
        <Route
          path="/generate-qr"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <GenerateQR />
            </ProtectedRoute>
          }
        />

        {/* Student Only */}
        <Route
          path="/scan-qr"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ScanQR />
            </ProtectedRoute>
          }
        />
        <Route path="/teacher/my-attendance" element={<ViewAttendance />} />

         <Route
          path="/student/attendance-history"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentAttendance />
            </ProtectedRoute>
          }
        />

          <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;