import { Link } from 'react-router-dom';

/**
 * NotFoundPage renders a 404 graphic message and redirects the user
 * to the landing page.
 */
const NotFoundPage = () => {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center p-3 text-center">
      <div className="card shadow border-0 rounded-4 p-4 p-sm-5" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
        <h3 className="fw-semibold mb-3">Page Not Found</h3>
        <p className="text-muted mb-4">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary px-4 py-2 fw-semibold">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
