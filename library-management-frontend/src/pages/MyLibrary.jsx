import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentNavbar from '../components/StudentNavbar';
import './styles/user.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

function MyLibrary() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortAsc, setSortAsc] = useState(false);
  const [fineModal, setFineModal] = useState(null);

  const token = localStorage.getItem('token');

  const fetchMyLibrary = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/student/mylibrary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyLibrary();
  }, []);

  const handleReturn = async (bookId) => {
    try {
      await axios.post('http://localhost:5000/api/student/return', { bookId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyLibrary();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenew = async (bookId) => {
    try {
      await axios.post('http://localhost:5000/api/student/renew', { bookId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyLibrary();
    } catch (err) {
      console.error(err);
    }
  };

  const daysLeft = (dueDate) => {
    if (!dueDate) return null;
    return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const isNearDue = (dueDate) => {
    const d = daysLeft(dueDate);
    return d !== null && d <= 3 && d >= 0;
  };

  const isOverDue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  const filteredBooks = books
    .filter((b) => (filter === 'all' ? true : b.status === filter))
    .sort((a, b) =>
      sortAsc
        ? new Date(a.requestedAt) - new Date(b.requestedAt)
        : new Date(b.requestedAt) - new Date(a.requestedAt)
    );

  useEffect(() => {
    const overdueBook = books.find(
      (b) => b.status === 'allocated' && isOverDue(b.dueDate) && !b.finePaid
    );
    if (overdueBook) setFineModal(overdueBook);
    else setFineModal(null);
  }, [books]);

  const closeModal = () => setFineModal(null);

  const handleDemoPayment = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/student/payfine', {
        bookId: fineModal._id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Fine_Invoice_${fineModal.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert("✅ Fine paid successfully!");
      setFineModal(null);
    } catch (err) {
      console.error('Error during payment or invoice generation', err);
    }
  };

  return (
    <>
      <StudentNavbar />

      <div className="main-container container py-4">
        <div
          className="bg-gradient p-4 rounded shadow mb-4 text-center text-light animate__animated animate__fadeInDown"
          style={{ background: 'linear-gradient(to right, #1b1440, #29215a)' }}
        >
          <h2
            className="display-6 fw-bold mb-1 gold-title"
          >📚 My Borrowed Books</h2>
          <p
            className="lead mb-0 mylibrary-subtitle"
          >Track your requested, allocated, or returned books</p>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 animate__animated animate__fadeInUp">
          <div className="btn-group" role="group">
            {['all', 'requested', 'allocated', 'returned'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setSortAsc(!sortAsc)}
          >
            {sortAsc ? 'Newest first' : 'Oldest first'}
          </button>
        </div>

        <section className="books-section">
          {filteredBooks.length === 0 ? (
            <div className="alert alert-info text-center animate__animated animate__fadeIn">
              You haven’t requested any books yet.
            </div>
          ) : (
            <div className="row g-4">
              {filteredBooks.map((book, i) => (
                <div className="col-md-4 col-sm-6" key={i}>
                  <div
                    className="card h-100 shadow-sm animate__animated animate__zoomIn"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{book.title}</h5>
                      <p className="card-text">{book.author}</p>
                      <span
                        className={`badge mb-2 px-3 py-2 bg-${book.status === 'requested'
                          ? 'warning'
                          : book.status === 'allocated'
                            ? 'success'
                            : 'secondary'
                          }`}
                        style={{ fontSize: '1em', borderRadius: '8px' }}
                      >
                        {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                      </span>

                      {book.dueDate && (
                        <p className={`mt-2 mb-1 ${isNearDue(book.dueDate) ? 'text-danger fw-bold' : ''}`}>
                          Due: {new Date(book.dueDate).toLocaleDateString()}
                        </p>
                      )}

                      {book.status === 'allocated' && (
                        <div className="d-flex gap-2 mt-auto">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleRenew(book._id)}
                          >
                            Renew
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleReturn(book._id)}
                          >
                            Return
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {fineModal && (
        <div
          className="modal fade show d-block animate__animated animate__fadeIn"
          tabIndex="-1"
          role="dialog"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content p-3">
              <h5 className="modal-title">⏰ Return date exceeded</h5>
              <div className="modal-body">
                <p>
                  The book <strong>{fineModal.title}</strong> is overdue.
                  A fine of <strong>₹50</strong> must be paid.
                </p>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-outline-dark" onClick={closeModal}>Cancel</button>
                <button className="btn btn-success" onClick={handleDemoPayment}>Pay ₹50 Fine</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyLibrary;
