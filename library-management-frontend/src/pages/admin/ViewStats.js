import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

function ViewStats() {
  const [stats, setStats] = useState(null);
  const [allocatedCount, setAllocatedCount] = useState(0);
  const token = localStorage.getItem('token');

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);

      // Fetch allocated books count
      const allocatedRes = await axios.get('http://localhost:5000/api/admin/allocated-books-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllocatedCount(allocatedRes.data.allocatedCount);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch statistics');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Chart data
  const chartData = {
    labels: ['Allocated Books', 'Available Books'],
    datasets: [
      {
        data: [
          allocatedCount,
          stats ? stats.bookCount - allocatedCount : 0
        ],
        backgroundColor: ['#007bff', '#28a745'],
        borderWidth: 1,
      },
    ],
  };

  // Download report handler
  const handleDownloadReport = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/download-report', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'library_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report');
    }
  };

  return (
    <div>
      <h3>📊 System Statistics</h3>
      {!stats ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="row mt-4">
            <div className="col-md-3">
              <div className="card text-white bg-primary mb-3">
                <div className="card-body">
                  <h5 className="card-title">📚 Total Books</h5>
                  <p className="card-text fs-4">{stats.bookCount}</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-success mb-3">
                <div className="card-body">
                  <h5 className="card-title">🎓 Students</h5>
                  <p className="card-text fs-4">{stats.studentCount}</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-warning mb-3">
                <div className="card-body">
                  <h5 className="card-title">📖 Librarians</h5>
                  <p className="card-text fs-4">{stats.librarianCount}</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-danger mb-3">
                <div className="card-body">
                  <h5 className="card-title">🕗 Pending Requests</h5>
                  <p className="card-text fs-4">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="mt-5">
            <h5>📈 Book Allocation Overview</h5>
            <div style={{ maxWidth: 400 }}>
              <Doughnut data={chartData} />
            </div>
            <div className="mt-2">
              <span className="badge bg-primary me-2">Allocated: {allocatedCount}</span>
              <span className="badge bg-success">Available: {stats.bookCount - allocatedCount}</span>
            </div>
          </div>

          {/* Download Report Section */}
          <div className="mt-5">
            <h5>📄 Download Student Book Activity Report</h5>
            <p>
              Download a formal report showing how many students have taken books, books added this month, active students, and more.
            </p>
            <button className="btn btn-outline-primary" onClick={handleDownloadReport}>
              Download Report (PDF)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ViewStats;
