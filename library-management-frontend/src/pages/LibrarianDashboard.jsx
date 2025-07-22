import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ManageBooks from './librarian/ManageBooks';
import AllocateRequests from './librarian/AllocateRequests';
import StudentList from './librarian/StudentList';
import './LibrarianDashboard.css';
import Swal from 'sweetalert2';

function LibrarianDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const librarian = user && user.role && user.role.includes('librarian') ? user : {
    name: 'Librarian',
    email: 'librarian@example.com',
    image: '/default-profile.png',
    role: 'Librarian'
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/');
      }
    });
  };

  return (
    <div className="librarian-layout">
      {/* Sidebar */}
      <nav className="librarian-sidebar">
        <h4>📘 Librarian Panel</h4>
        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <Link className="nav-link" to="/librarian/manage-books">📚 Manage Books</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/librarian/allocate">✅ Allocate Requests</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/librarian/students">👥 Student List</Link>
          </li>
          <li className="nav-item mt-4">
            <button className="btn btn-outline-light w-75 mx-3" onClick={handleLogout}>🚪 Logout</button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="librarian-content">
        <Routes>
          <Route
            path="*"
            element={
              <div>
                <div className="librarian-profile-card mx-auto mb-4">
                  <img src={librarian.image} alt="Librarian" />
                  <h4 className="mt-2">{librarian.name}</h4>
                  <p className="mb-1 text-muted">{librarian.role}</p>
                  <p className="mb-0"><strong>Email:</strong> {librarian.email}</p>
                </div>
                <div className="animated-welcome text-center mb-3">
                  <h2>
                    <span className="wave">👋</span> 
                    <span className="welcome-text">Welcome Back, {librarian.name}!</span>
                  </h2>
                </div>
                <h3 className="text-center">Select an option from the sidebar</h3>
              </div>
            }
          />
          <Route path="manage-books" element={<ManageBooks />} />
          <Route path="allocate" element={<AllocateRequests />} />
          <Route path="students" element={<StudentList />} />
        </Routes>
      </main>
    </div>
  );
}

export default LibrarianDashboard;
