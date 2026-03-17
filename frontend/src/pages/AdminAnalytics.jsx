import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';

/**
 * Helper component for the top stat boxes (from ContestSummary.js).
 */
const StatCard = ({ title, value, colorClass = 'text-gray-900' }) => (
  <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg flex-1">
    <div className="text-sm font-semibold muted">{title}</div>
    {value && (
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
    )}
  </div>
);

export default function AdminAnalytics() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [batchFilter, setBatchFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [stats, setStats] = useState({});
  const [batchStats, setBatchStats] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const deps = await api.fetchDepartments();
        // Assuming deps is an array of objects like { id: 1, name: 'CSE' }
        setDepartments(deps.map((d) => d.name));

        const res = await api.fetchAdminAnalytics(token);
        setUsers(res.users || []);
        setFiltered(res.users || []);
        setStats(res.stats || {});
        setBatchStats(res.batchStats || []);
        setDepartmentStats(res.departmentStats || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  useEffect(() => {
    let result = users;
    if (batchFilter !== 'all')
      result = result.filter((u) => u.batch === batchFilter);
    if (deptFilter !== 'all')
      result = result.filter((u) => u.department === deptFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [users, batchFilter, deptFilter, search]);

  const handleDownload = async () => {
    setDownloadError(null);
    try {
      const blob = await api.downloadAdminAnalytics(token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'admin_batch_stats.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setDownloadError('Failed to download CSV'); // Use styled error
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

  const batches = Array.from(new Set(users.map((u) => u.batch))).sort();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Analytics (Admin)</h1>

      {/* Styled Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.users ?? 0}
          colorClass="text-cyan-600"
        />
        <StatCard
          title="Faculty"
          value={stats.faculty ?? 0}
          colorClass="text-teal-600"
        />
        <StatCard
          title="Problems"
          value={stats.problems ?? 0}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Contests"
          value={stats.contests ?? 0}
          colorClass="text-indigo-600"
        />
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

      {/* Department-wise Summary Card */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-3">Department-wise Summary</h3>
        {departmentStats && departmentStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-2 font-semibold">Department</th>
                  <th className="py-2 px-2 font-semibold">Users</th>
                  <th className="py-2 px-2 font-semibold">Highest Rating</th>
                  <th className="py-2 px-2 font-semibold">Highest Solved</th>
                  <th className="py-2 px-2 font-semibold">Avg Rating</th>
                  <th className="py-2 px-2 font-semibold">Avg Solved</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((d) => (
                  <tr
                    key={d.department}
                    className="border-b border-gray-100 hover:bg-sky-50"
                  >
                    <td className="py-3 px-2 font-medium">{d.department}</td>
                    <td className="py-3 px-2">{d.users_count}</td>
                    <td className="py-3 px-2">{d.highest_rating ?? 0}</td>
                    <td className="py-3 px-2">{d.highest_solved ?? 0}</td>
                    <td className="py-3 px-2">
                      {Number(d.avg_rating || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-2">
                      {Number(d.avg_solved || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="muted text-center p-4">
            No department stats available
          </div>
        )}
      </div>

      {/* Filter Card */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-3">User Leaderboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name/email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input md:col-span-1"
          />
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="form-select"
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
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="form-select"
          >
            <option value="all" className="form-option">
              All Departments
            </option>
            {departments.map((d) => (
              <option key={d} value={d} className="form-option">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* User Table Card */}
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-2 font-semibold">Name</th>
                <th className="py-2 px-2 font-semibold">Department</th>
                <th className="py-2 px-2 font-semibold">Batch</th>
                <th className="py-2 px-2 font-semibold">Rating</th>
                <th className="py-2 px-2 font-semibold">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => navigate(`/profile/${u.id}`)}
                  className="cursor-pointer border-b border-gray-100 hover:bg-sky-50 transition-colors"
                >
                  <td className="py-3 px-2 font-medium">{u.name}</td>
                  <td className="py-3 px-2">{u.department || '—'}</td>
                  <td className="py-3 px-2">{u.batch}</td>
                  <td className="py-3 px-2">
                    <span className="badge !bg-yellow-100 !text-yellow-800 !font-bold !text-sm">
                      {u.rating}
                    </span>
                  </td>
                  <td className="py-3 px-2 muted">{u.email}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center muted py-6"
                  >
                    No users found matching filters
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