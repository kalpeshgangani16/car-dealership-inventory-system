import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

/**
 * RegisterPage handles new user account creation, displays errors/success,
 * and handles submit button disable/loading indicators.
 */
const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-center mb-4 fw-semibold">Create Account</h3>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success py-2 small" role="alert">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nameInput" className="form-label small fw-medium text-secondary">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="nameInput"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting || !!successMsg}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="emailInput" className="form-label small fw-medium text-secondary">Email Address</label>
          <input
            type="email"
            className="form-control"
            id="emailInput"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || !!successMsg}
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
            disabled={isSubmitting || !!successMsg}
            autoComplete="new-password"
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
          disabled={isSubmitting || !!successMsg}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Registering...</span>
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <p className="text-muted small mb-0">
          Already have an account?{' '}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
