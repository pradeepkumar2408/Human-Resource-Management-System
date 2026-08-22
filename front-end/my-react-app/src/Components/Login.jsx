import React, { useState } from 'react';

/**
 * Login.jsx - Dayflow HRMS (Deel.com Theme)
 * 
 * Role-Based Login Component styled completely with INLINE CSS (no external .css dependencies).
 * Sends user credentials directly to the backend API for verification.
 * 
 * Props:
 * - apiBaseUrl: String (optional, defaults to VITE_API_BASE_URL or 'http://localhost:8080')
 * - onLoginSuccess: Function(userData) (optional callback after successful backend authentication)
 * - onForgotPassword: Function() (optional callback for forgot password navigation)
 * - onSignUp: Function() (optional callback for signup navigation)
 */
export default function Login({
  apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  onLoginSuccess,
  onForgotPassword,
  onSignUp
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Hover states for inline interactive elements
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isForgotHovered, setIsForgotHovered] = useState(false);
  const [isSignUpHovered, setIsSignUpHovered] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Client-side validation before sending request to backend
  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Backend API Call - Verify user email and password against database
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Backend verification failed (e.g. invalid credentials, inactive user)
        const serverError = data?.message || data?.error || 'Invalid credentials or backend connection failed.';
        throw new Error(serverError);
      }

      // Successful verification from backend
      // Store JWT token and user profile returned by backend
      const token = data?.token || data?.jwt || data?.accessToken;
      if (token) {
        localStorage.setItem('dayflow_token', token);
      }
      if (data?.user || data) {
        localStorage.setItem('dayflow_user', JSON.stringify(data.user || data));
      }

      // Trigger callback if provided by parent App/Router
      if (onLoginSuccess) {
        onLoginSuccess(data);
      } else {
        // Fallback default navigation behavior
        console.log('Login successful:', data);
        window.dispatchEvent(new CustomEvent('dayflow_login_success', { detail: data }));
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to server. Please check your backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // INLINE STYLES (Deel.com Aesthetic)
  // ==========================================
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#0A0E17',
      backgroundImage: `
        radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 45%),
        radial-gradient(circle at 85% 80%, rgba(124, 58, 237, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.8) 0%, transparent 100%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '24px',
      boxSizing: 'border-box',
      color: '#F8FAFC'
    },
    card: {
      width: '100%',
      maxWidth: '440px',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '40px 36px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      boxSizing: 'border-box'
    },
    headerSection: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    logoContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px'
    },
    logoBadge: {
      width: '42px',
      height: '42px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.5)'
    },
    logoText: {
      fontSize: '24px',
      fontWeight: '800',
      letterSpacing: '-0.5px',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    title: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#FFFFFF',
      margin: '0 0 8px 0',
      letterSpacing: '-0.3px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#94A3B8',
      margin: '0',
      lineHeight: '1.5'
    },
    errorBanner: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '12px',
      padding: '12px 16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
      color: '#FCA5A5',
      lineHeight: '1.4'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#E2E8F0',
      marginBottom: '8px',
      letterSpacing: '0.2px'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    input: (fieldName) => ({
      width: '100%',
      padding: '12px 42px 12px 40px',
      backgroundColor: 'rgba(30, 41, 59, 0.6)',
      border: validationErrors[fieldName]
        ? '1px solid #EF4444'
        : focusedInput === fieldName
        ? '1px solid #6366F1'
        : '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '12px',
      fontSize: '14px',
      color: '#FFFFFF',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      boxShadow: focusedInput === fieldName
        ? '0 0 0 3px rgba(99, 102, 241, 0.25)'
        : 'none'
    }),
    inputIconLeft: {
      position: 'absolute',
      left: '14px',
      color: '#64748B',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none'
    },
    passwordToggleBtn: {
      position: 'absolute',
      right: '14px',
      background: 'none',
      border: 'none',
      color: '#94A3B8',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '6px',
      transition: 'color 0.2s ease'
    },
    fieldErrorText: {
      fontSize: '12px',
      color: '#FCA5A5',
      marginTop: '6px',
      display: 'block'
    },
    forgotWrapper: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '24px'
    },
    forgotLink: {
      background: 'none',
      border: 'none',
      fontSize: '13px',
      fontWeight: '500',
      color: isForgotHovered ? '#818CF8' : '#6366F1',
      cursor: 'pointer',
      padding: '0',
      textDecoration: 'none',
      transition: 'color 0.2s ease'
    },
    submitButton: {
      width: '100%',
      padding: '14px',
      background: isSubmitHovered && !isLoading
        ? 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%)'
        : 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.75 : 1,
      boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid #FFFFFF',
      borderRadius: '50%',
      animation: 'dayflowSpin 0.8s linear infinite'
    },
    footerSection: {
      marginTop: '28px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#94A3B8'
    },
    signUpBtn: {
      background: 'none',
      border: 'none',
      color: isSignUpHovered ? '#818CF8' : '#6366F1',
      fontWeight: '600',
      cursor: 'pointer',
      padding: '0 0 0 6px',
      fontSize: '14px',
      transition: 'color 0.2s ease'
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Inject keyframes for spinner using inline style tag */}
      <style>{`
        @keyframes dayflowSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #FFFFFF !important;
          -webkit-box-shadow: 0 0 0px 1000px #1E293B inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div style={styles.card}>
        {/* Header Branding */}
        <div style={styles.headerSection}>
          <div style={styles.logoContainer}>
            <div style={styles.logoBadge}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFFFFF' }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <polyline points="16 11 18 13 22 9"></polyline>
              </svg>
            </div>
            <span style={styles.logoText}>Dayflow</span>
          </div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Enter your credentials to access your account</p>
        </div>

        {/* Global Error Banner from Backend API */}
        {errorMessage && (
          <div style={styles.errorBanner}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email Address</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIconLeft}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                style={styles.input('email')}
                disabled={isLoading}
              />
            </div>
            {validationErrors.email && (
              <span style={styles.fieldErrorText}>{validationErrors.email}</span>
            )}
          </div>

          {/* Password Input */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIconLeft}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                style={styles.input('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggleBtn}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && (
              <span style={styles.fieldErrorText}>{validationErrors.password}</span>
            )}
          </div>

          {/* Forgot Password Link */}
          <div style={styles.forgotWrapper}>
            <button
              type="button"
              onClick={() => onForgotPassword && onForgotPassword()}
              onMouseEnter={() => setIsForgotHovered(true)}
              onMouseLeave={() => setIsForgotHovered(false)}
              style={styles.forgotLink}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={() => setIsSubmitHovered(true)}
            onMouseLeave={() => setIsSubmitHovered(false)}
            style={styles.submitButton}
          >
            {isLoading ? (
              <>
                <div style={styles.spinner} />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div style={styles.footerSection}>
          Don't have an account?
          <button
            type="button"
            onClick={() => onSignUp && onSignUp()}
            onMouseEnter={() => setIsSignUpHovered(true)}
            onMouseLeave={() => setIsSignUpHovered(false)}
            style={styles.signUpBtn}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
