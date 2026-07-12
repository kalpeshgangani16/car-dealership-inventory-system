import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignInAlt } from 'react-icons/fa';

/**
 * LoginPage renders the user credentials form, invokes authentication context
 * methods, manages loading states during submission, and shows backend errors.
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div>
      <h3 className="text-center mb-4 fw-semibold">Login</h3>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="emailInput" className="form-label small fw-medium text-secondary">Email Address</label>
          <input
            type="email"
            className="form-control"
            id="emailInput"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="passwordInput" className="form-label small fw-medium text-secondary">Password</label>
          <input
            type="password"
            className="form-control"
            id="passwordInput"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <FaSignInAlt />
              <span>Login</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <p className="text-muted small mb-0">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary fw-semibold text-decoration-none">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
