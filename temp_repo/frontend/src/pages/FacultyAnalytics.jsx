import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

export default function FacultyAnalytics() {
  const { token, user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [batchStats, setBatchStats] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [batchFilter, setBatchFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadError, setDownloadError] = useState(null); // For CSV download error
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.fetchDepartmentUsers(token, user.department_id);
        const sorted = res.sort((a, b) => b.rating - a.rating);
        setStudents(sorted);
        setFiltered(sorted);
        // fetch batch-wise aggregates for this department
        try {
          const bs = await api.fetchDepartmentBatchStats(
            token,
            user.department_id
          );
          setBatchStats(bs.batchStats || []);
        } catch (err) {
          console.warn('Failed to fetch department batch stats', err);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load department users');
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.department_id) load();
  }, [token, user]);

  useEffect(() => {
    let result = students;

    if (batchFilter !== 'all') {
      result = result.filter((s) => s.batch === batchFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [students, batchFilter, search]);

  const handleDownload = async () => {
    setDownloadError(null);
    try {
      const blob = await api.downloadDepartmentBatchStats(
        token,
        user.department_id
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `department_${user.department_id}_batch_stats.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setDownloadError('Failed to download CSV'); // Use styled error instead of alert
    }
  };

  // Styled loading state
  if (loading) {
    return (
      <div className="card p-8 text-center muted">Loading analytics...</div>
    );
  }

  // Styled error state
  if (error) {
    return (
      <div className="card p-6 bg-red-100 text-red-700 max-w-lg mx-auto text-center">
        {error}
      </div>
    );
  }

  const batches = Array.from(new Set(students.map((s) => s.batch))).sort();

  return (
    <div className="space-y-6">
      {/* Page Header & Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Department Analytics</h1>
          {/* Filter Form */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name/email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input w-full md:w-auto"
            />
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="form-select w-full md:w-auto"
            >
              <option value="all" className="form-option">
                All Batches
              </option>
              {batches.map((b) => (
                <option key={b} value={b} className="form-option">
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Batch-wise Summary Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">Batch-wise Summary</h3>
          <button className="btn btn-ghost" onClick={handleDownload}>
            Download CSV
          </button>
        </div>
        {downloadError && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
            {downloadError}
          </div>
        )}
        {batchStats && batchStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-2 font-semibold">Batch</th>
                  <th className="py-2 px-2 font-semibold">Users</th>
                  <th className="py-2 px-2 font-semibold">Highest Rating</th>
                  <th className="py-2 px-2 font-semibold">Highest Solved</th>
                  <th className="py-2 px-2 font-semibold">Avg Rating</th>
                  <th className="py-2 px-2 font-semibold">Avg Solved</th>
                </tr>
              </thead>
              <tbody>
                {batchStats.map((b) => (
                  <tr
                    key={b.batch}
                    className="border-b border-gray-100 hover:bg-sky-50"
                  >
                    <td className="py-3 px-2 font-medium">{b.batch}</td>
                    <td className="py-3 px-2">{b.users_count}</td>
                    <td className="py-3 px-2">{b.highest_rating ?? 0}</td>
                    <td className="py-3 px-2">{b.highest_solved ?? 0}</td>
                    <td className="py-3 px-2">
                      {Number(b.avg_rating || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      {Number(b.avg_solved || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="muted text-center p-4">
            No batch stats available
          </div>
        )}
      </div>

      {/* Student Leaderboard Card */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-3">Student Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-2 font-semibold">Name</th>
                <th className="py-2 px-2 font-semibold">Batch</th>
                <th className="py-2 px-2 font-semibold">Rating</th>
                <th className="py-2 px-2 font-semibold">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => navigate(`/profile/${s.id}`)}
                  className="cursor-pointer border-b border-gray-100 hover:bg-sky-50 transition-colors"
                >
                  <td className="py-3 px-2 font-medium">{s.name}</td>
                  <td className="py-3 px-2">{s.batch}</td>
                  <td className="py-3 px-2">
                    <span className="badge !bg-yellow-100 !text-yellow-800 !font-bold !text-sm">
                      {s.rating}
                    </span>
                  </td>
                  <td className="py-3 px-2 muted">{s.email}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center muted py-6"
                  >
                    No students found matching filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}