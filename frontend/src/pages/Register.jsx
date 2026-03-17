import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api, { fetchDepartments } from '../api';

export default function Register() {
  const { user, setToken, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    batch: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) navigate('/contests');
  }, [user, navigate]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setDepartments([]);
      }
    };
    loadDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.register({
        ...formData,
        department_id: formData.department,
      });
      setToken(res.token);
      setUser(res.user);
      navigate('/problems');
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
          <h2 className="text-2xl font-bold text-center mb-6">
            Create Student Account
          </h2>

          {/* Styled error message */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Using new .form-input class */}
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="form-input"
            />
            {/* Using new .form-input class */}
            <input
              required
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="form-input"
            />
            {/* Using new .form-input class */}
            <input
              required
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="form-input"
            />

            {/* Using new .form-select and .form-option classes */}
            <select
              required
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-select"
            >
              <option value="" disabled className="form-option">
                Select Department
              </option>
              {departments.map((dept) => (
                <option
                  key={dept.id}
                  value={dept.id}
                  className="form-option"
                >
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Using new .form-input class */}
            <input
              required
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              placeholder="Batch (e.g., 2022)"
              type="number" // Changed to number for better input
              min="2000" // Added validation
              max="2099" // Added validation
              className="form-input"
            />

            {/* Full-width button, using new .btn-primary styles */}
            <div className="mt-2">
              <button className="btn btn-primary w-full">Register</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}