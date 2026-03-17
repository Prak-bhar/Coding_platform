import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import * as api from '../api';
// FIX 1: Changed 'in' to 'from'
import { useNavigate } from 'react-router-dom';

export default function FacultyContestCreate() {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Updated message state to hold text and type
  const [message, setMessage] = useState({ text: '', type: '' });

  const [problem, setProblem] = useState({
    title: '',
    statement: '',
    difficulty: 'easy',
    tags: '',
  });
  const [contestId, setContestId] = useState(null);
  const navigate = useNavigate();

  // Helper to render styled messages
  const renderMessage = () => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    return (
      <div
        className={`mb-4 p-3 rounded-md ${
          isSuccess
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        } text-sm`}
      >
        {message.text}
      </div>
    );
  };

  const handleContest = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!title || !startTime || !endTime) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setMessage({
        text: 'End time must be after start time.',
        type: 'error',
      });
      return;
    }

    try {
      const res = await api.createContest(token, {
        title,
        start_time: startTime,
        end_time: endTime,
      });
      setMessage({
        text: `Contest created successfully (ID: ${res.contestId})`,
        type: 'success',
      });
      setContestId(res.contestId);
    } catch (err) {
      setMessage({
        text: err.message || 'Error creating contest',
        type: 'error',
      });
    }
  };

  const handleProblem = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!problem.title || !problem.statement || !problem.tags) {
      setMessage({ text: 'Please fill all problem fields.', type: 'error' });
      return;
    }

    try {
      const tags = problem.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const probRes = await api.createProblem(token, {
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        tags,
      });
      if (contestId) {
        await api.addProblemToContest(token, contestId, probRes.problemId);
      }
      setMessage({ text: 'Problem added successfully.', type: 'success' });
      // Clear form for the next problem
      setProblem({ title: '', statement: '', difficulty: 'easy', tags: '' });
    } catch (err) {
      setMessage({ text: err.message || 'Error adding problem', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New Contest</h1>

      {/* Card 1: Create Contest */}
      <div className="card p-6">
        <h2 className="text-xl mb-4 font-semibold">Step 1: Create Contest</h2>
        
        {/* Render message inside the card if no contest ID yet */}
        {!contestId && renderMessage()}

        <form onSubmit={handleContest} className="flex flex-col gap-4">
          <input
            className="form-input"
            placeholder="Contest Title"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            disabled={contestId} // Disable after creation
          />
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="datetime-local"
              className="form-input flex-1"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={contestId}
            />
            <input
              type="datetime-local"
              className="form-input flex-1"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={contestId}
            />
          </div>
          {!contestId && (
            <button className="btn btn-primary w-full" type="submit">
              Create Contest
            </button>
          )}
        </form>
      </div>

      {/* Card 2: Add Problems (shows after contest is created) */}
      {contestId && (
        <div className="card p-6">
          <h2 className="text-xl mb-3 font-semibold">
            Step 2: Add Problems to Contest #{contestId}
          </h2>
          
          {/* Render message inside this card now */}
          {renderMessage()}

          <form onSubmit={handleProblem} className="flex flex-col gap-4">
            <input
              className="form-input"
              placeholder="Problem Title"
              value={problem.title}
              required
              onChange={(e) => setProblem({ ...problem, title: e.target.value })}
            />
            <textarea
              className="form-input"
              placeholder="Problem Statement (HTML allowed)"
              value={problem.statement}
              required
              // FIX 2: Changed 'e.targe.value' to 'e.target.value'
              onChange={(e) =>
                setProblem({ ...problem, statement: e.target.value })
              }
            ></textarea>
            <select
              className="form-select"
              value={problem.difficulty}
              onChange={(e) =>
                setProblem({ ...problem, difficulty: e.target.value })
              }
            >
              <option value="easy" className="form-option">Easy</option>
              <option value="medium" className="form-option">Medium</option>
              <option value="hard" className="form-option">Hard</option>
            </select>
            <input
              className="form-input"
              placeholder="Tags (comma separated, e.g., math,dp)"
              required
              value={problem.tags}
              onChange={(e) => setProblem({ ...problem, tags: e.target.value })}
            />
            <button className="btn btn-primary" type="submit">
              Add Problem
            </button>
          </form>
        </div>
      )}

      {/* Navigation Button */}
      <button
        onClick={() => navigate('/faculty/my-contests')}
        className="btn btn-ghost w-full"
      >
        View My Contests →
      </button>
    </div>
  );
}