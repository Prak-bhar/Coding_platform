import React, { useEffect, useState } from 'react';
import api from '../api';

export default function ContestLeaderboard({ contest, token }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.fetchContestLeaderboard(token, contest.id);
        setRows(data.leaderboard || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    if (token && contest.id) load();
  }, [contest.id, token]);

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-3">Leaderboard</h3>

      {loading && <div className="muted text-center p-4">Loading...</div>}

      {error && (
        <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-2 font-semibold">Rank</th>
                <th className="py-2 px-2 font-semibold">User</th>
                <th className="py-2 px-2 font-semibold">Solved</th>
                <th className="py-2 px-2 font-semibold">Penalty</th>
                <th className="py-2 px-2 font-semibold">Time Sum (min)</th>
                <th className="py-2 px-2 font-semibold">Wrong Before</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.user_id}
                  className="border-b border-gray-100 hover:bg-sky-50"
                >
                  <td className="py-3 px-2 font-bold">{r.rank}</td>
                  <td className="py-3 px-2 font-medium">{r.user_name}</td>
                  <td className="py-3 px-2 text-green-600 font-bold">
                    {r.solved_count}
                  </td>
                  <td className="py-3 px-2">{r.penalty}</td>
                  <td className="py-3 px-2">{r.time_sum_minutes}</td>
                  <td className="py-3 px-2">{r.wrong_before_total}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center muted py-6"
                  >
                    No leaderboard data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}