import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentNavbar from '../components/StudentNavbar';
import 'animate.css';

function RequestBook() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line
  }, [query, category]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/student/books?search=${query}&category=${category}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  const handleRequest = async (bookId) => {
    try {
      await axios.post('http://localhost:5000/api/student/request', { bookId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Book requested successfully!');
      fetchBooks();
    } catch (err) {
      alert('Book already requested or error occurred');
    }
  };

  return (
    <>
      <StudentNavbar />
      <div className="container mt-4">
        <div className="bg-gradient p-4 rounded shadow mb-4 text-center animate__animated animate__fadeInDown"
          style={{ background: 'linear-gradient(90deg, #1b1440 0%, #29215a 100%)' }}>
          <h3
            className="display-6 fw-bold mb-1"
            style={{ color: '#ffd700' }} 
          >
            📚 Request a Book
          </h3>
          <p
            className="lead mb-0"
            style={{ color: '#d4e4a2ff' }} 
          >
            Find and request your favorite books from the library
          </p>
        </div>

        <div className="row mb-4 animate__animated animate__fadeInUp">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="Search books..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-2">
            <select className="form-select shadow-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Fiction">Fiction</option>
              <option value="Programming">Programming</option>
              {/* Add more as per DB */}
            </select>
          </div>
        </div>

        <div className="row">
          {books.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info text-center animate__animated animate__fadeIn">
                No books found.
              </div>
            </div>
          ) : (
            books.map((book, idx) => (
              <div className="col-md-4" key={book._id}>
                <div className={`card shadow mb-4 animate__animated animate__zoomIn`} style={{ animationDelay: `${idx * 0.08}s` }}>
                  <div className="card-body d-flex flex-column align-items-start">
                    <h5 className="card-title">{book.title}</h5>
                    <p className="card-text mb-1"><strong>Author:</strong> {book.author}</p>
                    <p className="card-text mb-2"><strong>Category:</strong> {book.category}</p>
                    {book.status === 'requested' || book.status === 'allocated' ? (
                      <span className={`badge bg-${book.status === 'requested' ? 'warning' : 'success'} mb-2`}>
                        {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                      </span>
                    ) : (
                      <button
                        className="btn btn-outline-primary mt-auto w-100"
                        onClick={() => handleRequest(book._id)}
                      >
                        Request Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default RequestBook;
