import React, { useState } from 'react';

/**
 * Login.jsx - Dayflow HRMS (Deel Theme - Black & White)
 * 
 * Features:
 * - Email & Password validation
 * - Password visibility toggle
 * - Role-based login (Employee/Admin verified via backend API)
 * - Seamless fallback for local frontend demo/testing when backend microservice is offline
 * - 100% INLINE CSS ONLY
 */
export default function Login({
  apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  theme = 'dark',
  onSignUp,
  onForgotPassword,
  onLoginSuccess
}) {
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#000000' : '#F8FAFC',
    cardBg: isDark ? '#0A0A0A' : '#FFFFFF',
    border: isDark ? '#262626' : '#E2E8F0',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#A1A1AA' : '#64748B',
    inputBg: isDark ? '#121212' : '#F1F5F9',
    buttonBg: isDark ? '#FFFFFF' : '#0F172A',
    buttonText: isDark ? '#000000' : '#FFFFFF',
    errorBg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
    errorText: isDark ? '#FCA5A5' : '#B91C1C'
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Attempt Backend API Authentication
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('dayflow_token', data.token || 'auth-token');
        localStorage.setItem('dayflow_user', JSON.stringify(data.user || { email, employeeId: 'EMP-1001' }));
        if (onLoginSuccess) onLoginSuccess(data);
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError('Connection error: The gateway is currently unreachable. Start the backend services.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // INLINE STYLES
  // ==========================================
  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      backgroundColor: colors.bg,
      color: colors.textPrimary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '20px',
      boxSizing: 'border-box'
    },
    card: {
      width: '100%',
      maxWidth: '440px',
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '24px',
      padding: '40px',
      boxSizing: 'border-box',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    brandWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '24px'
    },
    logoBadge: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      backgroundColor: colors.textPrimary,
      color: colors.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '800'
    },
    brandText: {
      fontSize: '24px',
      fontWeight: '800',
      letterSpacing: '-0.5px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '800',
      textAlign: 'center',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: colors.textSecondary,
      textAlign: 'center',
      margin: '0 0 28px 0'
    },
    errorBox: {
      backgroundColor: colors.errorBg,
      color: colors.errorText,
      border: `1px solid ${colors.errorText}`,
      borderRadius: '12px',
      padding: '12px 16px',
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: '8px'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    inputIcon: {
      position: 'absolute',
      left: '14px',
      color: colors.textSecondary,
      display: 'flex',
      alignItems: 'center'
    },
    input: {
      width: '100%',
      padding: '12px 14px 12px 42px',
      backgroundColor: colors.inputBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      fontSize: '14px',
      color: colors.textPrimary,
      outline: 'none',
      boxSizing: 'border-box'
    },
    eyeBtn: {
      position: 'absolute',
      right: '14px',
      background: 'none',
      border: 'none',
      color: colors.textSecondary,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    },
    forgotLink: {
      display: 'block',
      textAlign: 'right',
      fontSize: '13px',
      fontWeight: '600',
      color: colors.textSecondary,
      textDecoration: 'none',
      marginTop: '8px',
      cursor: 'pointer'
    },
    submitBtn: {
      width: '100%',
      padding: '14px',
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      marginTop: '8px',
      marginBottom: '24px'
    },
    footerText: {
      textAlign: 'center',
      fontSize: '13px',
      color: colors.textSecondary
    },
    signUpLink: {
      color: colors.textPrimary,
      fontWeight: '700',
      cursor: 'pointer',
      marginLeft: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandWrapper}>
          <div style={styles.logoBadge}>
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 16s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H4Zm4-5.95a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
              <path d="M2 1a2 2 0 0 0-2 2v9.5A1.5 1.5 0 0 0 1.5 14h.558a6 6 0 0 1 1.874-2.222A4.993 4.993 0 0 1 1.05 9.05a.5.5 0 0 1 .9-.434 3.993 3.993 0 0 0 6.1 0 .5.5 0 0 1 .9.434 4.993 4.993 0 0 1-2.882 2.728A6 6 0 0 1 8 14h6.5a1.5 1.5 0 0 0 1.5-1.5V3a2 2 0 0 0-2-2H2Z"/>
            </svg>
          </div>
          <span style={styles.brandText}>Dayflow</span>
        </div>

        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Enter your credentials to access your account</p>

        {error && (
          <div style={styles.errorBox}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                </svg>
              </span>
              <input
                type="email"
                placeholder="employee@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.53 3.53 0 0 1-1.174.203 3.5 3.5 0 0 1-3.5-3.5c0-.419.073-.82.203-1.174l.822.822a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8c.058.087.122.183.195.288.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.709.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 1 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                )}
              </button>
            </div>

            <a
              onClick={(e) => { e.preventDefault(); if (onForgotPassword) onForgotPassword(); }}
              style={styles.forgotLink}
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={styles.footerText}>
          Don't have an account?
          <span
            onClick={() => onSignUp && onSignUp()}
            style={styles.signUpLink}
          >
            Create account
          </span>
        </div>
      </div>
    </div>
  );
}
