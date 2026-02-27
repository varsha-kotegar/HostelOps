import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';

const categories = ['All', 'Electrical', 'Plumbing', 'Cleaning', 'Internet', 'Other'];
const priorities = ['All', 'Low', 'Medium', 'High'];
const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];

const AdminDashboard = () => {
  const { token, apiBaseUrl } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    priority: 'All'
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);

      const [complaintsRes, statsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/complaints?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiBaseUrl}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!complaintsRes.ok || !statsRes.ok) {
        throw new Error('Failed to load admin data');
      }

      const complaintsData = await complaintsRes.json();
      const statsData = await statsRes.json();
      setComplaints(complaintsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleStatusChange = async (id, status) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBaseUrl}/admin/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    if (!window.confirm(`Delete complaint #${id}?`)) return;
    try {
      const res = await fetch(`${apiBaseUrl}/admin/complaints/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to delete complaint');
      }
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="dashboard">
      <div className="card">
        <h2>Admin Dashboard</h2>
        {stats && (
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-label">Total</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
            <div className="stat">
              <span className="stat-label">In Progress</span>
              <span className="stat-value">{stats.in_progress}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Resolved</span>
              <span className="stat-value">{stats.resolved}</span>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>All Complaints</h2>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleApplyFilters}
          >
            Filter
          </button>
        </div>
        <div className="filters-row">
          <label>
            Status
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              {categories.map((c) => (
                <option key={c} value={c === 'All' ? 'All' : c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        {loading ? (
          <p>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p>No complaints found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Hostel / Room</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.student_name}</td>
                  <td>
                    {c.hostel_block} / {c.room_number}
                  </td>
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
                  <td>
                    <select
                      value={c.status}
                      onChange={(e) =>
                        handleStatusChange(c.id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <button
                      type="button"
                      className="btn-primary btn-small"
                      onClick={() =>
                        handleStatusChange(
                          c.id,
                          c.status === 'Pending'
                            ? 'In Progress'
                            : c.status === 'In Progress'
                              ? 'Resolved'
                              : 'Pending'
                        )
                      }
                    >
                      Update Status
                    </button>
                    <button
                      type="button"
                      className="btn-danger btn-small"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    </section>
  );
};

export default AdminDashboard;

