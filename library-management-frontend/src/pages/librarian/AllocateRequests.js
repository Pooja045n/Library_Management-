import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getToken } from '../../utils/auth';

function AllocateRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/librarian/requests', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      console.log("Request Data:", res.data);
      setRequests(res.data);
    } catch (err) {
      console.error('Error loading requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    let returnDate = null;

    if (action === 'accept') {
      const { value: dateInput } = await Swal.fire({
        title: 'Enter Return Date',
        input: 'date',
        inputLabel: 'Return Date (YYYY-MM-DD)',
        inputPlaceholder: 'Select a return date',
        confirmButtonText: 'Confirm',
        showCancelButton: true
      });

      if (!dateInput) {
        Swal.fire('Cancelled', 'No return date provided.', 'info');
        return;
      }

      returnDate = dateInput;
    }

    try {
      await axios.post('http://localhost:5000/api/librarian/requests/allocate', {
        requestId: id,
        action,
        returnDate
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      Swal.fire('Success', 'Request updated successfully', 'success');
      fetchRequests();
    } catch (err) {
      Swal.fire('Error', 'Failed to update the request', 'error');
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h3>📚 Allocate Book Requests</h3>
      {loading ? (
        <p>Loading requests...</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Book</th>
              <th>Author</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => {
              const isOverdue = req.returnDate && new Date(req.returnDate) < new Date();
              return (
                <tr key={req._id} className={isOverdue ? 'table-danger' : ''}>
                  <td>{req.studentId ? req.studentId.name : 'Unknown Student'}</td>
                  <td>{req.studentId ? req.studentId.email : 'No Email'}</td>
                  <td>{req.bookId ? req.bookId.title : 'Unknown Book'}</td>
                  <td>{req.bookId ? req.bookId.author : 'Unknown Author'}</td>
                  <td>
                    {req.returnDate && <small>{new Date(req.returnDate).toLocaleDateString()}</small>}
                    <br />
                    <button className="btn btn-success btn-sm me-2" onClick={() => handleAction(req._id, 'accept')}>
                      Accept
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleAction(req._id, 'deny')}>
                      Deny
                    </button>
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr><td colSpan="5" className="text-center">No pending requests</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllocateRequests;
