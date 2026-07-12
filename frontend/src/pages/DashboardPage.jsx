import { useAuth } from '../context/AuthContext';

/**
 * DashboardPage displays user details, role badge, login success confirmation,
 * and a secondary logout button.
 */
const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="d-flex justify-content-center mt-5">
      <div className="card shadow border-0 rounded-4 overflow-hidden" style={{ maxWidth: '650px', width: '100%' }}>
        <div className="card-header bg-primary text-white text-center py-4">
          <h4 className="mb-0 fw-bold">CarHub Dashboard</h4>
        </div>
        <div className="card-body p-4 p-sm-5 text-center">
          <h2 className="fw-semibold mb-3">
            Welcome, <span className="text-primary">{user?.name || 'User'}</span>!
          </h2>
          <p className="text-muted mb-4 fs-5">
            You are successfully logged in.
          </p>

          <div className="alert alert-info py-3 mb-4 rounded-3 text-start small">
            <h6 className="fw-bold mb-2">User Session Details:</h6>
            <div className="d-flex justify-content-between mb-1">
              <span>Name:</span> <strong>{user?.name}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Email:</span> <strong>{user?.email}</strong>
            </div>
          </div>

          <div className="alert alert-warning text-start py-3 mb-4 rounded-3 small border-0 bg-warning bg-opacity-10 text-warning-emphasis">
            <span className="me-1">🚘</span>
            Vehicle inventory features will appear here after the next implementation phase.
          </div>

          <div className="text-start mt-4">
            <h6 className="fw-bold text-secondary mb-3">Upcoming Features:</h6>
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="p-3 bg-light border border-light-subtle rounded-3 h-100">
                  <h6 className="fw-bold text-primary mb-2">📦 User Features</h6>
                  <ul className="list-unstyled mb-0 text-muted small lh-lg">
                    <li>• View Vehicle Catalog</li>
                    <li>• Dynamic Search & Filtering</li>
                    <li>• Purchase Vehicles</li>
                  </ul>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="p-3 bg-light border border-light-subtle rounded-3 h-100">
                  <h6 className="fw-bold text-danger mb-2">⚙️ Admin Control</h6>
                  <ul className="list-unstyled mb-0 text-muted small lh-lg">
                    <li>• Add / Create Vehicle</li>
                    <li>• Edit Specifications</li>
                    <li>• Delete / Restock Inventory</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
