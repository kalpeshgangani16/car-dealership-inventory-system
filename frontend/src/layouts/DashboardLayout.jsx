import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

/**
 * Standard layout for the authenticated space, providing navigation,
 * session details, and the logout action.
 */
const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div 
      className="min-vh-100 d-flex flex-column"
      style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef5ff 100%)' }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/dashboard">
            <span className="me-2">🚗</span>
            Car Dealership Inventory
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            {user && (
              <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
                <span className="text-white">
                  Logged in as: <strong className="text-warning">{user.name}</strong> <span className="badge bg-secondary text-capitalize ms-1">{user.role}</span>
                </span>
                <button className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center gap-2" onClick={logout}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container flex-grow-1 py-4">
        <Outlet />
      </main>

      <footer className="bg-white border-top py-3 text-center text-muted mt-auto">
        <small>&copy; {new Date().getFullYear()} Car Dealership Inventory System</small>
      </footer>
    </div>
  );
};

export default DashboardLayout;
