import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ViewUsers from './ViewUsers';
import ViewStats from './ViewStats';
import ActivityLog from './ActivityLog';
import AddUser from './AddUser'; 
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="d-flex">
      <div className="admin-sidebar p-3">
        <h4>🛡️ Admin Panel</h4>
        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <Link className="nav-link" to="/admin/users">👥 Manage Users</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/admin/add-user">➕ Add User</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/admin/stats">📊 Statistics</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/admin/activity">📜 Activity Log</Link>
          </li>
          <li className="nav-item mt-4">
            <button className="btn btn-outline-light w-100" onClick={handleLogout}>🚪 Logout</button>
          </li>
        </ul>
      </div>
      <div className="admin-content flex-grow-1 w-100 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        
        <Routes>
          <Route
            path="/"
            element={
              <div className="welcome-animated">
                <h2 className="welcome-title">👋 Welcome, Admin!</h2>
                <p className="welcome-subtitle">Manage your library with ease and confidence.</p>
              </div>
            }
          />
          <Route path="users" element={<ViewUsers />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="stats" element={<ViewStats />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="*" element={<h3 className="text-center">Select an option from the sidebar</h3>} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;
