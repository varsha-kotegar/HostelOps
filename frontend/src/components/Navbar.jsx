import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">HostelOps</div>
      <nav className="navbar-links">
        {!user && (
          <>
            <Link to="/login" className="btn-link">
              Login
            </Link>
            <Link to="/register" className="btn-link">
              Register
            </Link>
          </>
        )}
        {user && user.role === 'student' && (
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        )}
        {user && user.role === 'admin' && (
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

