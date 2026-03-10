import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Helper component for the top stat boxes.
 */
const StatCard = ({ title, value, children, colorClass = 'text-gray-900' }) => (
  <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg flex-1">
    <div className="text-sm font-semibold muted">{title}</div>
    {value && (
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
    )}
    {children && <div className="mt-1">{children}</div>}
  </div>
);

export default function ContestSummary({ contest, token }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [solversCount, setSolversCount] = useState(0);
  const [percentSolvers, setPercentSolvers] = useState(0);
  const [hardest, setHardest] = useState(null);
  const [easiest, setEasiest] = useState(null);

  useEffect(() => {
    if (!contest || !token) return;
    let mounted = true;
    setLoading(true);
    api
      .fetchContestSummary(token, contest.id)
      .then((res) => {
        if (!mounted) return;
        setSummary(res?.summary || []);
        setParticipantsCount(res?.participantsCount || 0);
        setSolversCount(res?.solversCount || 0);
        setPercentSolvers(res?.percent_solvers || 0);
        setHardest(res?.hardestProblem || null);
        setEasiest(res?.easiestProblem || null);
      })
      .catch((err) => setError(err?.message || 'Failed to load summary'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [contest, token]);

  // Styled loading state
  if (loading) {
    return (
      <div className="card p-8 text-center muted">Loading summary...</div>
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
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Contest Summary</h3>

      {/* Styled Stat Boxes */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Participants"
          value={participantsCount}
          colorClass="text-cyan-600"
        />
        <StatCard title="Solved ≥ 1" colorClass="text-green-600">
          <div className="text-3xl font-bold text-green-600">
            {solversCount}
            <span className="text-lg muted ml-2">
              ({percentSolvers.toFixed(1)}%)
            </span>
          </div>
        </StatCard>
        <StatCard title="Hardest / Easiest">
          <div className="text-sm space-y-1">
            {hardest ? (
              <div className="font-semibold">
                <span className="text-red-600">●</span> {hardest.problem_title}
                <span className="muted ml-2">
                  ({(hardest.success_rate * 100).toFixed(1)}%)
                </span>
              </div>
            ) : (
              <div className="muted">-</div>
            )}
            {easiest ? (
              <div className="font-semibold">
                <span className="text-green-600">●</span> {easiest.problem_title}
                <span className="muted ml-2">
                  ({(easiest.success_rate * 100).toFixed(1)}%)
                </span>
              </div>
            ) : null}
          </div>
        </StatCard>
      </div>

      {/* Styled Table */}
      {summary.length === 0 ? (
        <div className="muted text-center p-8">
          No problems or submissions yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="py-2 px-3 font-semibold text-left">Problem</th>
                <th className="py-2 px-3 font-semibold text-center">
                  Submissions
                </th>
                <th className="py-2 px-3 font-semibold text-center">AC</th>
                <th className="py-2 px-3 font-semibold text-center">
                  Unique Solvers
                </th>
                <th className="py-2 px-3 font-semibold text-center">
                  Avg subs to AC
                </th>
                <th className="py-2 px-3 font-semibold text-center">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s, idx) => (
                <tr
                  key={s.problem_id}
                  className="border-b border-gray-100 hover:bg-sky-50"
                >
                  <td className="px-3 py-3 font-medium">{s.problem_title}</td>
                  <td className="px-3 py-3 text-center font-medium">
                    {Number(s.submissions) || 0}
                  </td>
                  <td className="px-3 py-3 text-center text-green-600 font-medium">
                    {Number(s.ac_count) || 0}
                  </td>
                  <td className="px-3 py-3 text-center text-cyan-600 font-medium">
                    {Number(s.unique_solvers) || 0}
                  </td>
                  <td className="px-3 py-3 text-center muted">
                    {s.avg_submissions_to_ac
                      ? s.avg_submissions_to_ac.toFixed(2)
                      : '-'}
                  </td>
                  <td className="px-3 py-3 text-center font-medium">
                    {(s.success_rate * 100).toFixed(1)}%
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