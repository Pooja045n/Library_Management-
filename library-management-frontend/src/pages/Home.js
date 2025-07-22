import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./styles/home.css";
import Header from "./header";


export default function LibraryHome() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);

      const decoded = jwtDecode(res.data.token);
      const { role } = decoded.user;

      if (res.data.mustChangePassword) {
        navigate('/change-password');
      } else {
        if (role === "student") navigate('/student');
        else if (role === "librarian") navigate('/librarian');
        else if (role === "admin") navigate('/admin');
        else navigate('/');
      }
    } catch (err) {
      alert('Login failed');
    }
  };


  return (
    <>
      <Header />
      {/* Banner with embedded login form */}
      <section className="banner">
        <div className="banner-content">
          <div className="banner-text">
            <h2>Welcome to MyLibrary</h2>
            <p>Discover a world of books and knowledge</p>
          </div>

          <form className="login-box" onSubmit={handleLogin}>
            <h3>Login</h3>


            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            <p className="paragraph">
              Note: If you are an admin, librarian, or student, please log in to access your dashboard. no need to register.
            </p>
          </form>

        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 MyLibrary. All rights reserved.<br/>
          Developed by Learning Group 7<br/>
          Names: Nagapur Pooja, Sri charan, Sai Shravani<br/>
        </p>
      </footer>
    </>
  );
}
