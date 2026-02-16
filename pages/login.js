import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lang, setLang] = useState('en');
  const [showError, setShowError] = useState(false);

  const router = useRouter();
  const { redirect } = router.query;
  const { login, error, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect || '/');
    }
  }, [isAuthenticated, router, redirect]);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const success = await login({ username: email, password }, redirect || '/');
    if (!success) {
      setIsSubmitting(false);
      setShowError(true);
    }
  };

  return (
    <div className="auth-container lssi-login">
      <div className="auth-card lssi-card">
        <div className="lssi-logo-wrap">
          <img src="/images/icon.png" alt="General Q&A Logo" className="lssi-logo" />
        </div>
        <h2 className="lssi-signin-title">Sign in</h2>
        {showError && (
          <div className="lssi-error-bar">Please login to access this website.</div>
        )}
        <form onSubmit={handleSubmit} className="auth-form lssi-form">
          <div className="form-group lssi-field">
            <div className="lssi-input-icon">
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'error' : ''}
                placeholder="Email or Username"
                autoComplete="username"
              />
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          <div className="form-group lssi-field">
            <div className="lssi-input-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'error' : ''}
                placeholder="Password"
                autoComplete="current-password"
                style={{ paddingRight: '2.2em' }}
              />
              <span
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  fontSize: '1.2em',
                  color: '#888',
                  userSelect: 'none'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5 0-9.27-3.11-10.44-7.5a9.77 9.77 0 0 1 1.61-3.09"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.96 0 1.84-.36 2.53-.95"/><path d="M14.47 14.47A3.5 3.5 0 0 0 12 8.5c-.96 0-1.84.36-2.53.95"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12C2.73 7.11 7 4 12 4s9.27 3.11 10.44 8.5C21.27 16.89 17 20 12 20S2.73 16.89 1.56 12.5"/><circle cx="12" cy="12" r="3.5"/></svg>
                )}
              </span>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          <div className="form-footer lssi-footer">
            <div className="lssi-remember">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember">Remember Me</label>
            </div>
            <Link href="#" className="lssi-forgot">Forgot Password?</Link>
          </div>
          <button
            type="submit"
            className="lssi-login-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="lssi-terms">Terms of Service and Privacy Policy</div>
        <div className="lssi-lang-wrap">
          <span className="lssi-lang-icon">&#xf0ac;</span>
          <select
            className="lssi-lang-select"
            value={lang}
            onChange={e => setLang(e.target.value)}
          >
            <option value="en">English (United States)</option>
            <option value="es">Español</option>
          </select>
          <button className="lssi-lang-btn" type="button">Change</button>
        </div>
      </div>
      <style jsx>{`
        .lssi-login {
          background: #fff;
        }
        .lssi-card {
          box-shadow: none;
          border-radius: 12px;
          padding: 36px 32px 24px 32px;
          max-width: 400px;
        }
        .lssi-logo-wrap {
          text-align: center;
          margin-bottom: 18px;
        }
        .lssi-logo {
          max-width: 220px;
          height: auto;
          margin: 0 auto 8px auto;
          display: block;
        }
        .lssi-signin-title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 18px 0;
        }
        .lssi-error-bar {
          background: #e53935;
          color: #fff;
          border-radius: 6px;
          padding: 12px 0;
          text-align: center;
          font-size: 1rem;
          margin-bottom: 18px;
        }
        .lssi-form {
          margin-bottom: 0;
        }
        .lssi-field {
          margin-bottom: 18px;
        }
        .lssi-input-icon {
          position: relative;
        }
        .lssi-icon {
          font-family: 'FontAwesome', Arial, sans-serif;
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
          font-size: 1.1rem;
          pointer-events: none;
        }
        .lssi-input-icon input {
          padding-left: 38px;
        }
        .lssi-eye {
          font-family: 'FontAwesome', Arial, sans-serif;
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
          font-size: 1.1rem;
          cursor: pointer;
        }
        .lssi-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .lssi-remember label {
          margin-left: 6px;
          font-size: 0.97rem;
        }
        .lssi-forgot {
          font-size: 0.97rem;
          color: #222;
          opacity: 0.7;
          text-decoration: none;
        }
        .lssi-forgot:hover {
          text-decoration: underline;
        }
        .lssi-login-btn {
          width: 100%;
          background: #2953f3;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 13px 0;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 18px;
          margin-top: 0;
          box-shadow: 0 2px 8px rgba(41,83,243,0.08);
          transition: background 0.2s;
        }
        .lssi-login-btn:hover {
          background: #1d3bb3;
        }
        .lssi-terms {
          text-align: center;
          font-size: 0.97rem;
          color: #222;
          opacity: 0.7;
          margin-bottom: 24px;
        }
        .lssi-lang-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }
        .lssi-lang-icon {
          font-family: 'FontAwesome', Arial, sans-serif;
          font-size: 1.1rem;
          color: #222;
        }
        .lssi-lang-select {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }
        .lssi-lang-btn {
          background: #f5f5f5;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 6px 16px;
          font-size: 1rem;
          cursor: pointer;
        }
        @media (max-width: 600px) {
          .lssi-card { padding: 18px 6px 12px 6px; }
          .lssi-logo { max-width: 150px; }
        }
      `}</style>
    </div>
  );
}