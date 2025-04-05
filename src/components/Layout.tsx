import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <h1>ProctorEd</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            {currentUser?.role === 'instructor' || currentUser?.role === 'admin' ? (
              <>
                <li>
                  <Link to="/create-test">Create Test</Link>
                </li>
              </>
            ) : (
              <li>
                <Link to="/">My Tests</Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="user-info">
          <span>Hello, {currentUser?.name}</span>
          <button className="btn btn-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} ProctorEd - All rights reserved</p>
      </footer>
    </div>
  );
};

export default Layout; 