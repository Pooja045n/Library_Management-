import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LibraryHome from './pages/Home';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import MyLibrary from './pages/MyLibrary';
import RequestBook from './pages/RequestBook';
import LibrarianDashboard from './pages/LibrarianDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<LibraryHome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/student" element={<StudentDashboard/>}/>
          <Route path="/student/library" element={<MyLibrary />} />
          <Route path="/student/request" element={<RequestBook />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/librarian/*" element={<LibrarianDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </Router>
    </React.StrictMode>
  );
}

export default App;