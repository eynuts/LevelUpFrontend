import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Teacher from "./Teacher";
import Admin from "./Admin";
import AboutGame from "./AboutGame"; // ✅ ADD THIS
import TeacherDashboard from "./TeacherDashboard";
import { UserProvider } from "./UserContext";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Home />} />

          {/* About Game Page */}
          <Route path="/about" element={<AboutGame />} />

          {/* Teacher Pages */}
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          {/* Admin */}
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
