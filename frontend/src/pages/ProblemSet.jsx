import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Helper function to get a color-coded style for the difficulty badge
const getDifficultyStyle = (difficulty) => {
  if (!difficulty) return 'badge'; // Default

  const d = difficulty.toLowerCase();
  if (d === 'easy') {
    return '!bg-green-100 !text-green-700'; // Green
  }
  if (d === 'medium') {
    return '!bg-yellow-100 !text-yellow-700'; // Yellow
  }
  if (d === 'hard') {
    return '!bg-red-100 !text-red-700'; // Red
  }
  return 'badge'; // Default badge style from theme.css
};

export default function ProblemSet() {
  const { token } = useContext(AuthContext);
  const [problems, setProblems] = useState([]);
  const [q, setQ] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (q) params.q = q;
      if (difficulty) params.difficulty = difficulty;
      if (tags) params.tags = tags;
      const res = await api.fetchProblems(token, params);
      setProblems(res.data || []);
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // Load on initial render

  const submitFilter = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Problem Set</h1>

      {/* Filter Card */}
      <div className="card p-6">
        <form
          onSubmit={submitFilter}
          className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end"
        >
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 muted">
              Search
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="form-input"
              placeholder="Search title..."
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-1 muted">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="form-select"
            >
              <option value="" className="form-option">
                Any
              </option>
              <option value="easy" className="form-option">
                Easy
              </option>
              <option value="medium" className="form-option">
                Medium
              </option>
              <option value="hard" className="form-option">
                Hard
              </option>
            </select>
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 muted">
              Tags (comma separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="form-input"
              placeholder="math, dp, graphs"
            />
          </div>

          {/* Filter Button */}
          <div>
            <button className="btn btn-primary w-full">Filter</button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card p-8 text-center muted">Loading problems...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-6 bg-red-100 text-red-700 max-w-lg mx-auto text-center">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && problems.length === 0 && (
        <div className="card p-8 text-center muted">
          No problems match your filter.
        </div>
      )}

      {/* Problem List */}
      {!loading && !error && problems.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          {problems.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex justify-between items-start">
                {/* Left Side: Info */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                  <div className="flex gap-2">
                    <span
                      className={`badge !font-bold ${getDifficultyStyle(
                        p.difficulty
                      )}`}
                    >
                      {p.difficulty}
                    </span>
                    <span className="badge">
                      AC: {p.ac_percent ?? 0}%
                    </span>
                  </div>
                </div>

                {/* Right Side: Button */}
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/problems/${p.id}`}
                    state={{ problem: p }}
                    className="btn btn-primary"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}