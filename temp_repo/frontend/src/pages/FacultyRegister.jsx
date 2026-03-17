import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerFaculty, fetchDepartments } from '../api';
import AuthContext from '../context/AuthContext';

export default function FacultyRegister() {
  const { user, setToken, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department_id: '',
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/contests');
  }, [user, navigate]);

  useEffect(() => {
    fetchDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerFaculty(form);
      // Auto-login faculty after successful registration to match student flow
      if (res?.token) setToken(res.token);
      if (res?.user) setUser(res.user);
      navigate('/contests');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    // Wrapper to center the form on the page
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Using 'card' class from theme.css */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            Faculty Registration
          </h2>

          {/* Styled error message */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Using gap for spacing */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Using new .form-input class */}
            <input
              name="name"
              placeholder="Full Name"
              className="form-input"
              onChange={handleChange}
              required
            />
            {/* Using new .form-input class */}
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="form-input"
              onChange={handleChange}
              required
            />
            {/* Using new .form-input class */}
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="form-input"
              onChange={handleChange}
              required
            />
            {/* Using new .form-select and .form-option classes */}
            <select
              name="department_id"
              className="form-select"
              value={form.department_id}
              onChange={handleChange}
              required
            >
              <option value="" disabled className="form-option">
                Select Department
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id} className="form-option">
                  {d.name}
                </option>
              ))}
            </select>

            {/* Using new .btn-primary styles */}
            <div className="mt-2">
              <button className="btn btn-primary w-full" type="submit">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}