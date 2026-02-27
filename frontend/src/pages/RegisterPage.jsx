import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    hostelBlock: '',
    roomNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/student');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card auth-card">
      <h2>Student Registration</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <div className="form-row">
          <label>
            Hostel Block
            <input
              type="text"
              name="hostelBlock"
              value={form.hostelBlock}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Room Number
            <input
              type="text"
              name="roomNumber"
              value={form.roomNumber}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          Register
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
      <div className="auth-links">
        <span>
          Already registered?{' '}
          <Link to="/login" className="text-link">
            Login
          </Link>
        </span>
      </div>
    </section>
  );
};

export default RegisterPage;

