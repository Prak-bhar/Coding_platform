import React, { useEffect, useState } from 'react';
import api from '../api';

// Helper function (from Submissions.js)
const getVerdictStyle = (verdict) => {
  if (!verdict) return 'badge';
  const v = verdict.toLowerCase();
  if (v.includes('ac')) return '!bg-green-100 !text-green-700';
  if (v.includes('wa') || v.includes('error')) return '!bg-red-100 !text-red-700';
  if (v.includes('tle')) return '!bg-yellow-100 !text-yellow-700';
  if (v.includes('ce') || v.includes('running')) return '!bg-blue-100 !text-blue-700';
  return 'badge';
};

// Helper function (from Contests.js)
const formatDateTime = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleString(undefined, options);
};

export default function ContestSubmissions({ contest, token }) {
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    user_name: '',
    verdict: '',
    problem_title: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.fetchContestSubmissions(token, contest.id, filters);
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && contest?.id) load();
  }, [token, contest?.id]); // Only load on initial mount

  const apply = async (e) => {
    e?.preventDefault();
    await load();
  };

  // Reset filters and reload data
  const reset = async () => {
    const newFilters = { user_name: '', verdict: '', problem_title: '' };
    setFilters(newFilters);
    // Need to pass newFilters to load() directly, since setState is async
    setLoading(true);
    setError('');
    try {
      const data = await api.fetchContestSubmissions(token, contest.id, newFilters);
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-3">Submissions</h3>
      <p className="text-sm muted mb-4">
        Shows submissions made during the contest period.
      </p>

      {/* Styled filter form */}
      <form
        onSubmit={apply}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4"
      >
        <div className="md:col-span-1">
          <input
            placeholder="Search by user name"
            value={filters.user_name}
            onChange={(e) =>
              setFilters({ ...filters, user_name: e.target.value })
            }
            className="form-input"
          />
        </div>
        <div>
          <select
            value={filters.verdict}
            onChange={(e) =>
              setFilters({ ...filters, verdict: e.target.value })
            }
            className="form-select"
          >
            <option value="" className="form-option">All verdicts</option>
            <option value="AC" className="form-option">AC</option>
            <option value="WA" className="form-option">WA</option>
            <option value="TLE" className="form-option">TLE</option>
            <option value="RE" className="form-option">RE</option>
            <option value="CE" className="form-option">CE</option>
          </select>
        </div>
        <div className="md:col-span-1">
          <input
            placeholder="Search by problem title"
            value={filters.problem_title}
            onChange={(e) =>
              setFilters({ ...filters, problem_title: e.target.value })
            }
            className="form-input"
          />
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary w-full" type="submit">
            Filter
          </button>
          <button type="button" className="btn btn-ghost w-full" onClick={reset}>
            Reset
          </button>
        </div>
      </form>

      {/* Styled states */}
      {error && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading && <div className="muted text-center p-4">Loading...</div>}

      {!loading && submissions.length === 0 && (
        <div className="muted text-center p-8">No submissions found.</div>
      )}

      {/* Styled table */}
      {!loading && submissions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-2 font-semibold">Time</th>
                <th className="py-2 px-2 font-semibold">User</th>
                <th className="py-2 px-2 font-semibold">Problem</th>
                <th className="py-2 px-2 font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, idx) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 hover:bg-sky-50"
                >
                  <td className="py-3 px-2 text-sm muted">
                    {formatDateTime(s.created_at)}
                  </td>
                  <td className="py-3 px-2 font-medium">{s.user_name}</td>
                  <td className="py-3 px-2">{s.problem_title}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`badge !font-bold ${getVerdictStyle(
                        s.verdict
                      )}`}
                    >
                      {s.verdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}