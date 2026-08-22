import React, { useState } from 'react';

/**
 * ForgotPassword.jsx - Dayflow HRMS (Black & White Minimalist Theme)
 * 
 * 3-Stage Password Reset Workflow:
 * Stage 1: User enters email -> Sends OTP to email via backend
 * Stage 2: User enters OTP code -> Verified by backend
 * Stage 3: Redirects to Set New Password screen -> Stores new password in DB via backend
 * 
 * Styled 100% with INLINE CSS (no external .css dependencies).
 */
export default function ForgotPassword({
  apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  onNavigateToLogin
}) {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Set New Password
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifiedToken, setVerifiedToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Hover & focus states
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isBackHovered, setIsBackHovered] = useState(false);

  // STAGE 1: Send OTP to user email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setValidationErrors({ email: 'Email address is required' });
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to send OTP to email address.');
      }

      setSuccessMessage('A 6-digit OTP code has been sent to your email address.');
      setStep(2); // Advance to OTP verification
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to server. Please check backend API.');
    } finally {
      setIsLoading(false);
    }
  };

  // STAGE 2: Verify OTP code with backend
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setValidationErrors({ otpCode: 'Verification OTP code is required' });
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode.trim(),
          token: otpCode.trim()
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Fallback check if endpoint returns token or success
        throw new Error(data?.message || data?.error || 'Invalid or expired OTP code.');
      }

      setVerifiedToken(data?.resetToken || data?.token || otpCode.trim());
      setSuccessMessage('OTP verified successfully! Now set your new password.');
      setStep(3); // Advance to Set Password stage
    } catch (err) {
      setErrorMessage(err.message || 'OTP verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  // STAGE 3: Set & store new password in database
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode.trim(),
          resetToken: verifiedToken,
          newPassword: newPassword
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to update password in database.');
      }

      setSuccessMessage('Password reset & stored in database successfully! Redirecting to sign in...');
      setTimeout(() => {
        if (onNavigateToLogin) onNavigateToLogin();
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Error setting new password. Please try again.');
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
      maxWidth: '430px',
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
    stepBadges: {
      display: 'flex',
      justifyContent: 'center',
      gap: '6px',
      marginBottom: '24px'
    },
    stepPill: (active) => ({
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      backgroundColor: active ? '#FFFFFF' : '#18181B',
      color: active ? '#000000' : '#71717A',
      border: active ? '1px solid #FFFFFF' : '1px solid #27272A',
      transition: 'all 0.3s ease'
    }),
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
    successBanner: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid #FFFFFF',
      borderRadius: '10px',
      padding: '12px 16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '13px',
      color: '#FFFFFF',
      lineHeight: '1.4'
    },
    formGroup: {
      marginBottom: '20px'
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
      gap: '8px'
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
      marginTop: '28px',
      textAlign: 'center'
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: isBackHovered ? '#FFFFFF' : '#A1A1AA',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
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
      `}</style>

      <div style={styles.card}>
        <div style={styles.headerSection}>
          <div style={styles.logoContainer}>
            <div style={styles.logoBadge}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <span style={styles.logoText}>Dayflow</span>
          </div>

          <h1 style={styles.title}>
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Verify OTP Code'}
            {step === 3 && 'Set New Password'}
          </h1>
          <p style={styles.subtitle}>
            {step === 1 && "Enter your registered email to receive an OTP code."}
            {step === 2 && `Enter the OTP code sent to ${email}`}
            {step === 3 && "Create and confirm your new password to store in the database."}
          </p>
        </div>

        {/* Step Indicator Badges */}
        <div style={styles.stepBadges}>
          <span style={styles.stepPill(step === 1)}>1. Send OTP</span>
          <span style={styles.stepPill(step === 2)}>2. Verify OTP</span>
          <span style={styles.stepPill(step === 3)}>3. Set Password</span>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div style={styles.errorBanner}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div style={styles.successBanner}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* STAGE 1: Enter Email to Send OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">Registered Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIconLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
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
                  <span>Sending OTP...</span>
                </>
              ) : (
                <span>Send OTP Code</span>
              )}
            </button>
          </form>
        )}

        {/* STAGE 2: Verify OTP Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="otpCode">Enter OTP Code</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIconLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </span>
                <input
                  id="otpCode"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value); setErrorMessage(''); }}
                  onFocus={() => setFocusedInput('otpCode')}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.input('otpCode')}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.otpCode && (
                <span style={styles.fieldErrorText}>{validationErrors.otpCode}</span>
              )}
            </div>

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
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <span>Verify OTP</span>
              )}
            </button>
          </form>
        )}

        {/* STAGE 3: Set & Store New Password */}
        {step === 3 && (
          <form onSubmit={handleSetNewPassword} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="newPassword">New Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIconLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(''); }}
                  onFocus={() => setFocusedInput('newPassword')}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.input('newPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={styles.passwordToggleBtn}
                >
                  {showNewPassword ? (
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
              {validationErrors.newPassword && (
                <span style={styles.fieldErrorText}>{validationErrors.newPassword}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="confirmPassword">Confirm New Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIconLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(''); }}
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
                  <span>Storing password in database...</span>
                </>
              ) : (
                <span>Set & Store Password</span>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div style={styles.footerSection}>
          <button
            type="button"
            onClick={() => onNavigateToLogin && onNavigateToLogin()}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            style={styles.backBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
