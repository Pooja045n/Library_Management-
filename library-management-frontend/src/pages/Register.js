import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./styles/register.css";
import Header from "./header";

const books = [
  { title: "The Hobbit", author: "J.R.R. Tolkien", image: "https://via.placeholder.com/160x220" },
  { title: "Pride and Prejudice", author: "Jane Austen", image: "https://via.placeholder.com/160x220" },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", image: "https://via.placeholder.com/160x220" },
  { title: "The Da Vinci Code", author: "Dan Brown", image: "https://via.placeholder.com/160x220" },
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "student"
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.fullName,
        email: formData.email,
        role: formData.role
      });

      toast.success("Registered successfully! Check your email for your password.");
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <ToastContainer position="top-right" />
        <section className="banner">
          <div className="banner-content">
            <div className="banner-text">
              <h2>Create Your Library Account</h2>
              <p>Join and start exploring endless books!</p>
            </div>

            <form className="login-box" onSubmit={handleSubmit}>
              <h3>Register</h3>

              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select One</option>
                <option value="student">Student</option>
                <option value="librarian">Librarian</option>
              </select>

              <p className="text-center mt-2">
                Already have an account? <a href="/">Login</a>
              </p>
            </form>
          </div>
        </section>

        <section className="books-section">
          <h3>📚 Featured Books</h3>
          <div className="books-grid">
            {books.map((book, idx) => (
              <div className="book-card" key={idx}>
                <img src={book.image} alt={book.title} />
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          <p>&copy; 2025 MyLibrary. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
