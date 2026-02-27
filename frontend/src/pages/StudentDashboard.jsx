import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';

const categories = ['Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Other'];
const priorities = ['Low', 'Medium', 'High'];

const StudentDashboard = () => {
  const { token, apiBaseUrl, user } = useAuth();
  const [form, setForm] = useState({
    category: 'Electrical',
    description: '',
    priority: 'Medium'
  });
  const [imageFile, setImageFile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    if (!token) return;
    setListLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/complaints`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to load complaints');
      }
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      const body = new FormData();
      body.append('category', form.category);
      body.append('description', form.description);
      body.append('priority', form.priority);
      if (imageFile) {
        body.append('image', imageFile);
      }

      const res = await fetch(`${apiBaseUrl}/complaints`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to submit complaint');
      }
      setForm({ category: 'Electrical', description: '', priority: 'Medium' });
      setImageFile(null);
      await fetchComplaints();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dashboard">
      <div className="card">
        <h2>Submit Complaint</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </label>
          <label>
            Upload Image
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            Submit Complaint
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>My Complaints</h2>
          <button
            type="button"
            className="btn-secondary"
            onClick={fetchComplaints}
          >
            View My Complaints
          </button>
        </div>
        {listLoading ? (
          <p>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p>No complaints submitted yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.category}</td>
                  <td>{c.priority}</td>
                  <td>{c.status}</td>
                  <td>
                    {c.created_at &&
                      new Date(c.created_at).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user && (
        <div className="card small-card">
          <h3>Student Info</h3>
          <p>
            <strong>{user.name}</strong>
          </p>
          <p>
            {user.hostelBlock} / Room {user.roomNumber}
          </p>
        </div>
      )}
    </section>
  );
};

export default StudentDashboard;

