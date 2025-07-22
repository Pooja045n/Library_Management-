import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StudentNavbar from '../components/StudentNavbar';

function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'http://localhost:5000/api/user/change-password',
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Password changed successfully!');
      setSuccess(true);

      setTimeout(() => {
        const role = localStorage.getItem('role');
        if (role === 'student') navigate('/student');
        else if (role === 'librarian') navigate('/librarian');
        else if (role === 'admin') navigate('/admin');
        else navigate('/'); // fallback
      }, 3000);
    } catch (err) {
      toast.error('Password change failed');
    }
  };

  const handleResendEmail = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const email = res.data.email;

      await axios.post('http://localhost:5000/api/auth/resend-password-email', { email });
      toast.success('Login info email resent successfully!');
    } catch (err) {
      toast.error('Failed to resend email.');
    }
  };

  return (
    <>
      <StudentNavbar />
      <div className="auth-bg d-flex align-items-center justify-content-center vh-100">
        <div className="card p-4 auth-card shadow-lg">
          <h3 className="mb-4 text-center text-warning">Change Your Password</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              className="form-control mb-3"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button className="btn btn-success w-100">Update Password</button>
          </form>

          {success && (
            <div className="mt-4 text-center">
              <button className="btn btn-outline-primary" onClick={handleResendEmail}>
                📧 Resend Login Email
              </button>
            </div>
          )}
        </div>
        <ToastContainer position="top-right" />
      </div>
    </>
  );
}

export default ChangePassword;
