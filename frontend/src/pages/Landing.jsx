import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function Landing() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/contests');
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      <h1 className="text-4xl font-bold">Welcome to CodeArena 🏆</h1>
      <p className="text-gray-500 max-w-md">
        Compete, code, and climb the leaderboard. Join as a student or faculty to
        manage contests and problems.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
        <Link to="/register" className="btn btn-ghost">
          Student Sign Up
        </Link>
        <Link to="/faculty/register" className="btn btn-ghost accent">
          Faculty Sign Up
        </Link>
      </div>
    </div>
  );
}