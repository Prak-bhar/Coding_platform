import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

// Helper function to get a color-coded style for the verdict badge
const getVerdictStyle = (verdict) => {
  if (!verdict) return 'badge'; // Default

  const v = verdict.toLowerCase();
  if (v.includes('ac')) {
    return '!bg-green-100 !text-green-700'; // Green
  }
  if (v.includes('wa') || v.includes('error')) {
    return '!bg-red-100 !text-red-700'; // Red
  }
  if (v.includes('tle')) {
    return '!bg-yellow-100 !text-yellow-700'; // Yellow
  }
  if (v.includes('ce') || v.includes('running')) {
    return '!bg-blue-100 !text-blue-700'; // Blue
  }
  return 'badge'; // Default badge style from theme.css
};

// Helper to format date
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

export default function Submissions() {
  const { token } = useContext(AuthContext);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await api.getMySubmissions(token);
        setSubs(res.data || []);
      } catch (e) {
        setErr(e?.message || JSON.stringify(e));
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="card p-6">
        <h2 className="text-3xl font-bold">My Submissions</h2>
        <div className="muted text-lg mt-1">
          Your latest submissions are shown below
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card p-8 text-center muted">Loading...</div>
      )}

      {/* Error State */}
      {err && (
        <div className="card p-6 bg-red-100 text-red-700 max-w-lg mx-auto text-center">
          {err}
        </div>
      )}

      {/* Content */}
      {!loading && !err && (
        <div className="card p-6">
          <div className="space-y-3">
            {/* Empty State */}
            {subs.length === 0 && (
              <div className="text-center p-8 muted">
                You haven't made any submissions yet.
              </div>
            )}

            {/* Submissions List */}
            {subs.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center p-4 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <div className="text-lg font-semibold">{s.title}</div>
                  <div className="muted text-sm">
                    {formatDateTime(s.created_at)}
                  </div>
                </div>
                {/* Use the colorful verdict badge */}
                <div
                  className={`badge !font-bold ${getVerdictStyle(s.verdict)}`}
                >
                  {s.verdict}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}