import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StudentList() {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/librarian/students/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data.students);
    } catch (err) {
      alert('Error fetching students');
      console.error(err);
    }
  };

  const approveStudent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/librarian/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Student approved');
      fetchStudents();
    } catch (err) {
      alert('Approval failed');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="container mt-3">
      <h3>📋 Registered Students</h3>
      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Approved</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => (
            <tr key={stu._id}>
              <td>{stu.name}</td>
              <td>{stu.email}</td>
              <td>{stu.approved ? '✅ Yes' : '❌ No'}</td>
              <td>
                {!stu.approved && (
                  <button
                    onClick={() => approveStudent(stu._id)}
                    className="btn btn-sm btn-success"
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;
