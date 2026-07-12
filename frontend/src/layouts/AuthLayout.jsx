import { Outlet } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';

/**
 * Centered card layout for Auth pages (Login, Register).
 */
const AuthLayout = () => {
  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eaf2ff 100%)' }}
    >
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div className="fs-1 text-primary mb-2">
              <FaCar />
            </div>
            <h2 className="fw-bold text-primary mb-1">CarHub Inventory</h2>
            <p className="text-muted small mb-0">Vehicle Management System</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
