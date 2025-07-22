import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function ViewUsers() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User deleted');
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert('Delete failed');
      }
    }
  };

  const handlePromote = async (id, level) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/promote/${id}`, { level }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Promoted to ${level}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Promotion failed');
    }
  };


  const handleApprove = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('User approved!');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Approval failed');
    }
  };


  return (
    <div>
      <h3>👥 Manage Users</h3>
      <table className="table table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name || '—'}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                {!u.approved && (
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => handleApprove(u._id)}
                  >
                    Approve
                  </button>
                )}

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(u._id)}
                >
                  Delete
                </button>
              </td>

            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan="5">No users found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ViewUsers;
