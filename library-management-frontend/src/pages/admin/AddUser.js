import React, { useState } from 'react';
import axios from 'axios';

function AddUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // 'success' or 'danger'

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const res = await axios.post('http://localhost:5000/admin/create-user',
        { name, email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.msg);
      setType('success');
      setName('');
      setEmail('');
      setRole('student');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Server error. Could not create user.';
      setMessage(msg);
      setType('danger');
    }

    // Auto-hide after 4s
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">➕ Add New User</h3>

      {message && (
        <div className={`alert alert-${type}`} role="alert">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name:</label>
          <input type="text" className="form-control"
            value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Email:</label>
          <input type="email" className="form-control"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Role:</label>
          <select className="form-select"
            value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="librarian">Librarian</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">Add User</button>
      </form>
    </div>
  );
}

export default AddUser;
