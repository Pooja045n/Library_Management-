import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ActivityLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/activity-log', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h3 className="mb-4">📜 Activity Log</h3>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
            <th>Details</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.userId?.name || 'N/A'}</td>
              <td>{log.userId?.email}</td>
              <td>{log.role}</td>
              <td>{log.action}</td>
              <td>{JSON.stringify(log.meta)}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityLog;
