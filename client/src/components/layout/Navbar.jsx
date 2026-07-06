import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span>Code<span className="brand-accent">Arena</span></span>
        </NavLink>

        <div className="navbar-links">
          <NavLink
            to="/problems"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Problems
          </NavLink>
          <NavLink
            to="/contests"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Contests
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Leaderboard
          </NavLink>
          {user && (
            <NavLink
              to="/submissions"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Submissions
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin/problems"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ color: 'var(--primary)' }}
            >
              Admin Dashboard
            </NavLink>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {user.username}
              </NavLink>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost btn-sm">
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
