import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

// A helper function to format dates (you can move this to a utils file)
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

export default function Contests() {
  const { token } = useContext(AuthContext);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.fetchContests(token);
        if (Array.isArray(data)) {
          setContests(data);
        } else {
          console.warn('Unexpected response format:', data);
          setContests([]); // Ensure it's an array
        }
      } catch (e) {
        console.error('Failed to load contests:', e);
        setContests([]); // Set to empty array on error
      }
      setLoading(false);
    };
    if (token) load();
  }, [token]);

  const now = new Date();

  const categorize = (contest) => {
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);
    if (now < start) return 'Upcoming';
    if (now > end) return 'Past';
    return 'Ongoing';
  };

  // Function to get a color class based on category
  const getBadgeStyle = (category) => {
    switch (category) {
      case 'Ongoing':
        return 'bg-green-100 text-green-700'; // Green for ongoing
      case 'Upcoming':
        return 'bg-blue-100 text-blue-700'; // Blue for upcoming (using theme colors)
      case 'Past':
        return 'bg-gray-100 text-gray-600'; // Gray for past
      default:
        return 'badge'; // Default badge style from theme.css
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contests</h1>

      {/* Show loading indicator */}
      {loading && <div className="text-center p-8">Loading contests...</div>}

      {/* Show message if no contests are found */}
      {!loading && contests.length === 0 && (
        <div className="card p-8 text-center muted">
          No contests found at the moment.
        </div>
      )}

      {/* Display contests */}
      {!loading && contests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-1">
          {contests.map((c) => {
            const category = categorize(c);
            return (
              <div
                key={c.id}
                className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{c.title}</h2>
                  {/* Updated text color to match the theme */}
                  <div className="text-sm text-sky-700">
                    {c.department_name
                      ? `${c.department_name} Department`
                      : 'College-wide'}
                  </div>
                  <div className="mt-1 text-sm text-sky-800">
                    {formatDateTime(c.start_time)} →{' '}
                    {formatDateTime(c.end_time)}
                  </div>
                  <div className="mt-3">
                    {/* Using a custom badge style for better status indication */}
                    <span
                      className={`badge ${getBadgeStyle(
                        category
                      )} mr-2 !font-bold`} // Overriding default badge style
                    >
                      {category}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2 items-center">
                  {/* Using btn and btn-primary classes from theme.css */}
                  <Link
                    to={`/contests/${c.id}`}
                    className="btn btn-primary"
                    aria-label={`Open contest ${c.title}`}
                  >
                    View Contest
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}