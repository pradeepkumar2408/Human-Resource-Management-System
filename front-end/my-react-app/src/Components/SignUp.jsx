import React, { useState } from 'react';

/**
 * SignUp.jsx - Dayflow HRMS (Black & White Minimalist Theme)
 * 
 * Admin Pre-registered Account Activation Workflow:
 * - Admin creates employee record: (id, email, role)
 * - Employee enters Employee ID, Email, Role, Password, Confirm Password.
 * - Backend verifies if record exists; if valid, stores user's password in database.
 * 
 * Styled 100% with INLINE CSS (no external .css dependencies).
 */
export default function SignUp({
  apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  onSignUpSuccess,
  onNavigateToLogin
}) {
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    role: 'EMPLOYEE',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Hover and focus states for inline CSS
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);

  // Password rule checker
  const getPasswordRules = (pwd) => {
    return {
      length: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[^A-Za-z0-9]/.test(pwd)
    };
  };

  const passwordRules = getPasswordRules(formData.password);
  const passedRulesCount = Object.values(passwordRules).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!formData.password) return { text: '', color: '#71717A' };
    if (passedRulesCount <= 2) return { text: 'Weak', color: '#EF4444' };
    if (passedRulesCount <= 4) return { text: 'Medium', color: '#F59E0B' };
    return { text: 'Strong', color: '#10B981' };
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.employeeId.trim()) {
      errors.employeeId = 'Employee ID is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
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
      // Send payload to backend to verify admin-created record & set password
      const response = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          employeeId: formData.employeeId.trim(),
          email: formData.email.trim(),
          role: formData.role,
          password: formData.password
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const serverError = data?.message || data?.error || 'Account details not found or not pre-registered by Admin/HR.';
        throw new Error(serverError);
      }

      // Success -> trigger next action (e.g. verify email or login)
      if (onSignUpSuccess) {
        onSignUpSuccess(data, formData.email.trim());
      } else {
        console.log('Account activated successfully:', data);
        window.dispatchEvent(new CustomEvent('dayflow_signup_success', { detail: { data, email: formData.email.trim() } }));
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to verify details with backend database.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // INLINE STYLES (Black & White Theme)
  // ==========================================
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#000000',
      backgroundImage: `
        radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.07) 0%, transparent 50%),
        radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '24px',
      boxSizing: 'border-box',
      color: '#FFFFFF'
    },
    card: {
      width: '100%',
      maxWidth: '460px',
      backgroundColor: '#0A0A0A',
      border: '1px solid #262626',
      borderRadius: '20px',
      padding: '40px 36px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      boxSizing: 'border-box'
    },
    headerSection: {
      textAlign: 'center',
      marginBottom: '28px'
    },
    logoContainer: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '16px'
    },
    logoBadge: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)'
    },
    logoText: {
      fontSize: '24px',
      fontWeight: '800',
      letterSpacing: '-0.5px',
      color: '#FFFFFF'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#FFFFFF',
      margin: '0 0 8px 0',
      letterSpacing: '-0.3px'
    },
    subtitle: {
      fontSize: '13px',
      color: '#A1A1AA',
      margin: '0',
      lineHeight: '1.5'
    },
    infoBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid #27272A',
      borderRadius: '8px',
      padding: '8px 12px',
      marginBottom: '20px',
      fontSize: '12px',
      color: '#D4D4D8',
      textAlign: 'center'
    },
    errorBanner: {
      backgroundColor: '#18181B',
      border: '1px solid #52525B',
      borderRadius: '10px',
      padding: '12px 16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
      color: '#FAFAFA',
      lineHeight: '1.4'
    },
    formGroup: {
      marginBottom: '18px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#E4E4E7',
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
      backgroundColor: '#121212',
      border: validationErrors[fieldName]
        ? '1px solid #FFFFFF'
        : focusedInput === fieldName
        ? '1px solid #FFFFFF'
        : '1px solid #27272A',
      borderRadius: '10px',
      fontSize: '14px',
      color: '#FFFFFF',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      boxShadow: focusedInput === fieldName
        ? '0 0 0 2px rgba(255, 255, 255, 0.2)'
        : 'none'
    }),
    select: {
      width: '100%',
      padding: '12px 14px',
      backgroundColor: '#121212',
      border: focusedInput === 'role' ? '1px solid #FFFFFF' : '1px solid #27272A',
      borderRadius: '10px',
      fontSize: '14px',
      color: '#FFFFFF',
      outline: 'none',
      boxSizing: 'border-box',
      cursor: 'pointer'
    },
    inputIconLeft: {
      position: 'absolute',
      left: '14px',
      color: '#71717A',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none'
    },
    passwordToggleBtn: {
      position: 'absolute',
      right: '14px',
      background: 'none',
      border: 'none',
      color: '#71717A',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '6px'
    },
    fieldErrorText: {
      fontSize: '12px',
      color: '#A1A1AA',
      marginTop: '6px',
      display: 'block'
    },
    strengthBarWrapper: {
      marginTop: '10px'
    },
    strengthHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#71717A',
      marginBottom: '6px'
    },
    strengthTrack: {
      height: '4px',
      width: '100%',
      backgroundColor: '#27272A',
      borderRadius: '2px',
      overflow: 'hidden',
      display: 'flex',
      gap: '4px'
    },
    strengthSegment: (index) => ({
      flex: 1,
      height: '100%',
      backgroundColor: index < passedRulesCount ? getStrengthLabel().color : '#27272A',
      transition: 'background-color 0.3s ease'
    }),
    rulesList: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '6px',
      marginTop: '10px',
      fontSize: '11px',
      color: '#71717A'
    },
    ruleItem: (isValid) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: isValid ? '#FFFFFF' : '#71717A'
    }),
    submitButton: {
      width: '100%',
      padding: '14px',
      backgroundColor: isSubmitHovered && !isLoading ? '#E4E4E7' : '#FFFFFF',
      color: '#000000',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.75 : 1,
      boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '8px'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid rgba(0, 0, 0, 0.2)',
      borderTop: '2px solid #000000',
      borderRadius: '50%',
      animation: 'dayflowSpin 0.8s linear infinite'
    },
    footerSection: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#71717A'
    },
    loginBtn: {
      background: 'none',
      border: 'none',
      color: isLoginHovered ? '#FFFFFF' : '#D4D4D8',
      fontWeight: '600',
      cursor: 'pointer',
      padding: '0 0 0 6px',
      fontSize: '14px',
      textDecoration: isLoginHovered ? 'underline' : 'none',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @keyframes dayflowSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #FFFFFF !important;
          -webkit-box-shadow: 0 0 0px 1000px #121212 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div style={styles.logoContainer}>
            <div style={styles.logoBadge}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <polyline points="16 11 18 13 22 9"></polyline>
              </svg>
            </div>
            <span style={styles.logoText}>Dayflow</span>
          </div>
          <h1 style={styles.title}>Activate Account</h1>
          <p style={styles.subtitle}>Enter your pre-assigned details & set your password</p>
        </div>

        <div style={styles.infoBadge}>
          ℹ️ Account creation is verified against Admin/HR records (ID, Email & Role).
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div style={styles.errorBanner}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Employee ID */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="employeeId">Employee ID (Assigned by Admin)</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIconLeft}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                id="employeeId"
                type="text"
                name="employeeId"
                placeholder="EMP-1001"
                value={formData.employeeId}
                onChange={handleChange}
                onFocus={() => setFocusedInput('employeeId')}
                onBlur={() => setFocusedInput(null)}
                style={styles.input('employeeId')}
                disabled={isLoading}
              />
            </div>
            {validationErrors.employeeId && (
              <span style={styles.fieldErrorText}>{validationErrors.employeeId}</span>
            )}
          </div>

          {/* Email Address */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Work Email</label>
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

          {/* Role Selector */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="role">Assigned Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              onFocus={() => setFocusedInput('role')}
              onBlur={() => setFocusedInput(null)}
              style={styles.select}
              disabled={isLoading}
            >
              <option value="EMPLOYEE">Employee (Default)</option>
              <option value="ADMIN">Admin / HR Officer</option>
            </select>
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">Set Password</label>
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
                placeholder="Minimum 8 characters"
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
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && (
              <span style={styles.fieldErrorText}>{validationErrors.password}</span>
            )}

            {/* Password Strength Meter */}
            {formData.password && (
              <div style={styles.strengthBarWrapper}>
                <div style={styles.strengthHeader}>
                  <span>Password strength</span>
                  <span style={{ color: getStrengthLabel().color, fontWeight: '600' }}>
                    {getStrengthLabel().text}
                  </span>
                </div>
                <div style={styles.strengthTrack}>
                  <div style={styles.strengthSegment(0)} />
                  <div style={styles.strengthSegment(1)} />
                  <div style={styles.strengthSegment(2)} />
                  <div style={styles.strengthSegment(3)} />
                  <div style={styles.strengthSegment(4)} />
                </div>
                <div style={styles.rulesList}>
                  <span style={styles.ruleItem(passwordRules.length)}>✓ 8+ chars</span>
                  <span style={styles.ruleItem(passwordRules.hasUpper)}>✓ Uppercase</span>
                  <span style={styles.ruleItem(passwordRules.hasLower)}>✓ Lowercase</span>
                  <span style={styles.ruleItem(passwordRules.hasNumber)}>✓ Number</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIconLeft}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </span>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                style={styles.input('confirmPassword')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.passwordToggleBtn}
              >
                {showConfirmPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <span style={styles.fieldErrorText}>{validationErrors.confirmPassword}</span>
            )}
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
                <span>Verifying & setting password...</span>
              </>
            ) : (
              <span>Verify & Activate Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footerSection}>
          Already activated your account?
          <button
            type="button"
            onClick={() => onNavigateToLogin && onNavigateToLogin()}
            onMouseEnter={() => setIsLoginHovered(true)}
            onMouseLeave={() => setIsLoginHovered(false)}
            style={styles.loginBtn}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
