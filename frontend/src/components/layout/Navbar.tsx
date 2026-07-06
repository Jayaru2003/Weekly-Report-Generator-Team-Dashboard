import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user?.role === 'MANAGER' ? '/dashboard' : '/my-reports'}>
          📋 Weekly Reports
        </Link>
      </div>

      {isAuthenticated && (
        <div className="navbar-links">
          <Link to="/my-reports">My Reports</Link>
          {user?.role === 'MANAGER' && (
            <>
              <Link to="/projects">Projects</Link>
              <Link to="/dashboard">Dashboard</Link>
            </>
          )}
          <button className="btn-link" onClick={handleLogout}>
            Logout
          </button>
          <span className="navbar-user">
            {user?.firstName} ({user?.role})
          </span>
        </div>
      )}
    </nav>
  );
}
