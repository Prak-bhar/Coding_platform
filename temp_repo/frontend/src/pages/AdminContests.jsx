import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Helper to format date (copied from Contests.js for consistency)
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

export default function AdminContests() {
  const { token } = useContext(AuthContext);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminContests = async () => {
      try {
        const res = await api.fetchAdminContests(token);
        setContests(res);
      } catch (err) {
        console.error('Failed to fetch admin contests:', err);
        setError('Failed to load contests');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAdminContests();
  }, [token]);

  // Styled loading state
  if (loading) {
    return (
      <div className="card p-8 text-center muted">Loading...</div>
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Contests (Admin)</h1>

      {contests.length === 0 ? (
        // Styled empty state
        <div className="card p-8 text-center muted">
          No contests found in the system.
        </div>
      ) : (
        <div className="space-y-4">
          {contests.map((c) => (
            // Using the theme's 'card' class
            <div
              key={c.id}
              className="card p-5 flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div>
                <h3 className="text-xl font-semibold">{c.title}</h3>
                <p className="text-sm muted mt-1">
                  {formatDateTime(c.start_time)} →{' '}
                  {formatDateTime(c.end_time)}
                </p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                {/* Styled "Edit" button */}
                {new Date() <= new Date(c.end_time) ? (
                  <Link
                    to={`/admin/contest/${c.id}/edit`}
                    className="btn btn-ghost"
                  >
                    Edit
                  </Link>
                ) : (
                  <span
                    className="btn btn-ghost opacity-60 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    Edit (locked)
                  </span>
                )}
                {/* Styled "View" button */}
                <Link to={`/contests/${c.id}`} className="btn btn-primary">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}