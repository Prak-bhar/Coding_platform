import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

const VERDICTS = ['AC', 'WA', 'TLE', 'RE', 'CE'];

// Helper function (copied from ProblemSet.js for consistency)
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

export default function ProblemDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { token } = useContext(AuthContext);
  const [problem, setProblem] = useState(state?.problem || null);
  const [verdict, setVerdict] = useState('AC');
  const [ok, setOk] = useState(null);
  const [err, setErr] = useState(null);
  const [isLoading, setIsLoading] = useState(!state?.problem); // Add loading state

  useEffect(() => {
    const load = async () => {
      if (problem) return; // Already have it from location state

      setIsLoading(true);
      try {
        // This is inefficient, but matches the provided logic.
        // A direct `api.fetchProblemById(id)` would be better.
        const res = await api.fetchProblems(token, { limit: 1000 });
        const found = (res.data || []).find(
          (p) => String(p.id) === String(id)
        );
        setProblem(found || null);
      } catch (e) {
        console.error(e);
        setErr('Failed to load problem.'); // Set an error for the user
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, problem, token]);

  const submit = async (e) => {
    e.preventDefault();
    setOk(null);
    setErr(null);
    if (!problem) return setErr('No problem loaded');
    try {
      await api.createSubmission(token, { problem_id: problem.id, verdict });
      setOk('Submission saved successfully!');
    } catch (e) {
      setErr(e?.message || JSON.stringify(e));
    }
  };

  // Styled loading state
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center muted">
        Loading problem...
      </div>
    );
  }

  // Styled "not found" state
  if (!problem) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card p-6 bg-red-100 text-red-700 max-w-md w-full text-center">
          Problem not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Problem Card */}
      <div className="card p-6">
        <h2 className="text-3xl font-bold">{problem.title}</h2>
        <div className="flex gap-2 mt-3 mb-4">
          <span
            className={`badge !font-bold ${getDifficultyStyle(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
          <span className="badge">AC: {problem.ac_percent ?? 0}%</span>
        </div>

        {/* Styled problem statement box */}
        <div
          className="mt-4 p-4 bg-sky-50 border border-sky-100 rounded-lg prose max-w-none"
          dangerouslySetInnerHTML={{ __html: problem.statement }}
        />
      </div>

      {/* Submission Card */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold mb-3">Submit (Simulated)</h3>
        
        {/* Success/Error Messages */}
        {ok && (
          <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 text-sm">
            {ok}
          </div>
        )}
        {err && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={verdict}
            onChange={(e) => setVerdict(e.target.value)}
            className="form-select w-full sm:w-auto flex-1"
          >
            {VERDICTS.map((v) => (
              <option key={v} value={v} className="form-option">
                {v}
              </option>
            ))}
          </select>
          <button className="btn btn-primary w-full sm:w-auto">Submit</button>
        </form>
      </div>
    </div>
  );
}