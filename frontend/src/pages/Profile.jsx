import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

// Helper component for the difficulty blocks
const DifficultyStat = ({ label, attempted, solved, colorClass }) => (
  <div
    className={`p-4 rounded-lg flex-1 ${colorClass} bg-opacity-10 border ${colorClass} border-opacity-20`}
  >
    <div
      className={`text-sm font-bold uppercase ${colorClass} ${colorClass === 'text-gray-500' ? '' : 'text-opacity-70'
        }`}
    >
      {label}
    </div>
    <div className="text-2xl font-bold mt-1">{solved || 0}</div>
    <div className="text-sm opacity-70">{attempted || 0} attempted</div>
  </div>
);

export default function Profile() {
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = id
          ? await api.fetchProfileById(token, id)
          : await api.fetchProfile(token);
        setProfile(data);
      } catch (err) {
        setError(err?.message || 'Failed to load profile');
      }
    };
    if (token) load();
  }, [token, id]);

  // Styled error state
  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card p-6 bg-red-100 text-red-700 max-w-md w-full text-center">
          {error}
        </div>
      </div>
    );
  }

  // Styled loading state
  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center muted">
        Loading profile...
      </div>
    );
  }

  const { user, stats, weak_topics } = profile;

  const difficultyCounts = profile.difficulty_counts || [];
  const tagCounts = profile.tag_counts || [];
  const contestsCount = profile.contests_count || 0;
  const contestHistory = profile.contest_history || [];
  // filter weak topics with >= 40% wrong rate
  const weakFiltered = (weak_topics || []).filter(
    (t) => Number(t.wrong_percent) >= 40
  );

  // Helper to find difficulty stats
  const getDifficulty = (diff) => {
    return (
      difficultyCounts.find((r) => (r.difficulty || '').toLowerCase() === diff) || {
        attempted: 0,
        solved: 0,
      }
    );
  };
  const easyStats = getDifficulty('easy');
  const mediumStats = getDifficulty('medium');
  const hardStats = getDifficulty('hard');

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="card p-6">
        <h2 className="text-3xl font-bold">{user.name}</h2>
        <p className="muted text-lg">
          {user.department || 'General'} • Batch {user.batch || '-'}
        </p>
        <div className="mt-3 flex gap-3">
          {/* Cleaned up badge styles */}
          <span className="badge !bg-yellow-100 !text-yellow-800 !font-bold !text-sm">
            Rating: {user.rating}
          </span>
          {/* This uses the default .badge style from theme.css */}
          <span className="badge !text-sm">{user.role}</span>
        </div>
      </div>

      {/* Grid for stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Submission Stats */}
        <div className="card p-6">
          <h3 className="text-xl mb-3 font-semibold">Submission Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="muted">Total Submissions:</span>
              <span className="font-bold">{stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="muted">Accepted:</span>
              <span className="font-bold text-green-600">{stats.ac}</span>
            </div>
            <div className="flex justify-between">
              <span className="muted">Accuracy:</span>
              <span className="font-bold text-teal-600">
                {stats.ac_percent}%
              </span>
            </div>
          </div>
        </div>

        {/* Contests Count */}
        <div className="card p-6 flex flex-col justify-center">
          <h3 className="text-xl mb-3 font-semibold">Contests</h3>
          <div className="text-5xl font-bold text-cyan-600">
            {contestsCount}
          </div>
          <div className="muted">Contests given</div>
        </div>

        {/* Weak Topics */}
        <div className="card p-6">
          <h3 className="text-xl mb-3 font-semibold">Weak Topics</h3>
          {weakFiltered.length === 0 ? (
            <div className="text-green-600">
              Great going — keep practicing!
            </div>
          ) : (
            <>
              <div className="text-sm text-yellow-600 mb-2">
                Focus on these tags to improve accuracy
              </div>
              <div className="space-y-1">
                {weakFiltered.map((t, i) => (
                  <div
                    key={i}
                    className="flex justify-between border-b border-gray-100 py-1"
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="text-red-600 font-medium">
                      {t.wrong_percent}% wrong
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="card p-6">
        <h3 className="text-xl mb-4 font-semibold">Difficulty Breakdown</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <DifficultyStat
            label="Easy"
            attempted={easyStats.attempted}
            solved={easyStats.solved}
            colorClass="text-green-600"
          />
          <DifficultyStat
            label="Medium"
            attempted={mediumStats.attempted}
            solved={mediumStats.solved}
            colorClass="text-yellow-600"
          />
          <DifficultyStat
            label="Hard"
            attempted={hardStats.attempted}
            solved={hardStats.solved}
            colorClass="text-red-600"
          />
        </div>
      </div>

      {/* Tag & Contest History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tag-wise Problem Counts */}
        <div className="card p-6">
          <h3 className="text-xl mb-3 font-semibold">Tag-wise Problem Counts</h3>
          {tagCounts.length === 0 ? (
            <div className="muted">No tag data available</div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="py-2 px-2 font-semibold">Tag</th>
                    <th className="py-2 px-2 font-semibold">Attempted</th>
                    <th className="py-2 px-2 font-semibold">Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {tagCounts.map((t) => (
                    <tr
                      key={t.name}
                      className="border-b border-gray-100 hover:bg-sky-50"
                    >
                      <td className="py-3 px-2 font-medium">{t.name}</td>
                      <td className="py-3 px-2">{t.attempted}</td>

                      <td className="py-3 px-2 text-green-600 font-medium">
                        {t.solved}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contest History */}
        <div className="card p-6">
          <h3 className="text-xl mb-3 font-semibold">Contest History</h3>
          {contestHistory.length === 0 ? (
            <div className="muted">No contest history</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {contestHistory.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center border-b border-gray-100 py-3"
                >
                  <div>
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-sm muted">
                      {new Date(c.start_time).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-bold">
                      Solved: {c.solved_count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}