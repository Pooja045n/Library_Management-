import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBook, FaUsers, FaClock, FaStar } from 'react-icons/fa';
import StudentNavbar from '../components/StudentNavbar';
import './styles/user.css';

function StudentDashboard() {
    const [books, setBooks] = useState([]);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ yourRequests: 0, allocatedBooks: 0 });
    const token = localStorage.getItem('token');

    // Get username from localStorage (object or string)
    let username = '';
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.username) {
            username = user.username;
        } else if (localStorage.getItem('username')) {
            username = localStorage.getItem('username');
        }
    } catch {
        if (localStorage.getItem('username')) {
            username = localStorage.getItem('username');
        }
    }

    const fetchBooks = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/student/books?search=${query}&category=${category}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/student/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats', err);
        }
    };

    const handleRequest = async (bookId) => {
        try {
            await axios.post(`http://localhost:5000/api/student/request`, { bookId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Book requested!');
            fetchBooks();
        } catch (err) {
            setMessage('Book already requested or error occurred');
        }
    };

    useEffect(() => {
        fetchBooks();
        fetchStats();
        // eslint-disable-next-line
    }, [query, category]);

    return (
        <>
            <StudentNavbar />

            <div className="main-container">
                {/* Custom Banner */}
                <section className="banner animate__animated animate__fadeInDown">
                    <div className="banner-content">
                        <div className="banner-text">
                            <h2>
                                Welcome{username ? `, ${username}` : ''} to MyLibrary
                            </h2>
                            <p>Explore books and manage your personal library</p>
                        </div>
                    </div>
                </section>
                <div className="stats animate__animated animate__fadeInUp">
                    {/* Stats section */}
                    <div className="stats">
                        <div className="stat-box">
                            <FaBook className="icon blue" />
                            <p className="value">{books.length}</p>
                            <p className="label">Books Available</p>
                        </div>
                        <div className="stat-box">
                            <FaUsers className="icon green" />
                            <p className="value">{stats.yourRequests}</p>
                            <p className="label">Your Requests</p>
                        </div>
                        <div className="stat-box">
                            <FaClock className="icon orange" />
                            <p className="value">—</p>
                            <p className="label">Hours Read</p>
                        </div>
                        <div className="stat-box">
                            <FaStar className="icon light-green" />
                            <p className="value">—</p>
                            <p className="label">Completed Books</p>
                        </div>
                        <div className="stat-box">
                            <FaClock className="icon orange" />
                            <p className="value">{stats.allocatedBooks}</p>
                            <p className="label">Allocated Books</p>
                        </div>
                    </div>
                </div>

                {message && <div className="alert alert-info text-center">{message}</div>}

                <section className="books-section">
                    <h3 className="text-center text-primary mb-3">📘 Available Books</h3>
                    <div className="books-grid">
                        {books.length === 0 ? (
                            <p className="text-center text-muted">No books found.</p>
                        ) : (
                            books.slice(0, 7).map(book => (
                                <div className="book-card shadow-sm animate__animated animate__zoomIn" key={book._id}>
                                    <h4>{book.title}</h4>
                                    <p>{book.author}</p>
                                    <p><small className="text-muted">{book.category}</small></p>
                                    {book.status === 'requested' || book.status === 'allocated' ? (
                                        <span className={`badge bg-${book.status === 'requested' ? 'warning' : book.status === 'allocated' ? 'success' : 'secondary'}`}>
                                            {book.status}
                                        </span>
                                    ) : (
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => handleRequest(book._id)}
                                        >
                                            Request
                                        </button>
                                    )}
                                    {message && (
                                        <div className="alert alert-info text-center animate__animated animate__fadeInDown">
                                            {message}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    {books.length > 8 && (
                        <div className="text-center mt-3">
                            <a href="/student/request" className="btn btn-primary">
                                View More
                            </a>
                        </div>
                    )}
                </section>
                <footer className="footer mt-4">
                    <p>&copy; 2025 MyLibrary. All rights reserved.<br />
                        Developed by Learning Group 7<br />
                        Names: Nagapur Pooja, Sri charan, Sai Shravani<br />
                    </p>
                </footer>
            </div>
        </>
    );
}

export default StudentDashboard;
