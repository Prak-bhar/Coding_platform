import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // if already logged in, redirect away from login page
  React.useEffect(() => {
    if (user) navigate('/contests');
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const { setToken, setUser } = useContext(AuthContext);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.login(email, password, role);
      setToken(res.token);
      setUser(res.user);
      navigate('/contests');
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    }
  };

  return (
    // Wrapper to center the form on the page
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Using 'card' class from theme.css */}
        <div className="card p-6 sm:p-8">
          {/* Centered and styled the title */}
          <h2 className="text-2xl font-bold text-center mb-6">
            Login to Your Account
          </h2>

          {/* Styled the error message */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Increased gap between form elements */}
          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Using new .form-input class */}
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="form-input"
            />
            {/* Using new .form-input class */}
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input"
            />
            {/* Using new .form-select and .form-option classes */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              <option className="form-option" value="user">
                Student
              </option>
              <option className="form-option" value="faculty">
                Faculty
              </option>
              <option className="form-option" value="admin">
                Admin
              </option>
            </select>
            {/* Using new .btn-primary styles from theme.css */}
            <div className="mt-2">
              <button className="btn btn-primary w-full">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}