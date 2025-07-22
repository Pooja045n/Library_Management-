import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from 'react-icons/fa';
import "./studentNavbar.css";

function StudentNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const toggleDark = () => {
    document.body.classList.toggle('dark-mode');
    setDark(!dark);
    localStorage.setItem('theme', !dark ? 'dark' : 'light');
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.body.classList.add('dark-mode');
      setDark(true);
    }
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/student/request?search=${search}&category=${category}`);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <Link className="navbar-brand" to="/student">📘 Library Portal</Link>
      </div>

      <input
        type="text"
        className="search-bar"
        placeholder="Search books..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearch}
      />

      <nav className="nav">
        <Link to="/student/request">BooksList</Link>
        <Link to="/student/library">My Library</Link>
        
        <button className="btn btn-sm btn-light" onClick={toggleDark}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>

        <button className="btn btn-sm btn-outline-danger ms-2" onClick={logout}>
          Logout
        </button>
        <button
          className="btn profile-btn"
          onClick={() => navigate('/student/profile')}
          aria-label="Profile"
          title="Profile"
        >
          <FaUserCircle size={24} style={{ color: "#00ffc3" }} />
        </button>
      </nav>
    </header>
  );
}

export default StudentNavbar;
