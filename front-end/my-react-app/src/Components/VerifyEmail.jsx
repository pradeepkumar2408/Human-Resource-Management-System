import React, { useState, useEffect } from 'react';

/**
 * VerifyEmail.jsx - Dayflow HRMS (Black & White Minimalist Theme)
 * 
 * OTP Email Verification Component styled completely with INLINE CSS (no external .css dependencies).
 * Specs from PDF:
 * - OTP input box / verification status message
 * - Resend verification link with cooldown timer
 * - Backend fetch to POST /api/auth/verify-email
 * 
 * Props:
 * - email: String (email address being verified)
 * - apiBaseUrl: String (optional)
 * - onVerificationSuccess: Function(data) (callback after successful verification)
 * - onNavigateToLogin: Function() (callback to return to login)
 */
export default function VerifyEmail({
  email = '',
  apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  onVerificationSuccess,
  onNavigateToLogin
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(60); // 60s resend timer
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Hover & focus states
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isResendHovered, setIsResendHovered] = useState(false);
  const [isBackHovered, setIsBackHovered] = useState(false);

  // Cooldown countdown timer effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);
    setErrorMessage('');

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          otp: code,
          token: code
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Verification failed. Invalid or expired OTP.');
      }

      setSuccessMessage('Email verified successfully! Redirecting to sign in...');
      setTimeout(() => {
        if (onVerificationSuccess) onVerificationSuccess(data);
        else if (onNavigateToLogin) onNavigateToLogin();
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to verify email. Please check your backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Could not resend code. Please try again later.');
      }

      setSuccessMessage('A new 6-digit code has been sent to your email.');
      setCooldown(60);
    } catch (err) {
      setErrorMessage(err.message || 'Error resending code.');
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
      maxWidth: '440px',
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
      fontSize: '14px',
      color: '#A1A1AA',
      margin: '0',
      lineHeight: '1.5'
    },
    emailHighlight: {
      color: '#FFFFFF',
      fontWeight: '600'
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
    otpContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '8px',
      marginBottom: '28px'
    },
    otpInput: (index) => ({
      width: '48px',
      height: '56px',
      backgroundColor: '#121212',
      border: focusedIndex === index ? '1px solid #FFFFFF' : '1px solid #27272A',
      borderRadius: '10px',
      fontSize: '20px',
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      outline: 'none',
      boxShadow: focusedIndex === index ? '0 0 0 2px rgba(255, 255, 255, 0.2)' : 'none',
      transition: 'all 0.2s ease'
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
    resendWrapper: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#71717A'
    },
    resendBtn: {
      background: 'none',
      border: 'none',
      color: canResend ? (isResendHovered ? '#FFFFFF' : '#D4D4D8') : '#52525B',
      fontWeight: '600',
      cursor: canResend ? 'pointer' : 'not-allowed',
      padding: '0 0 0 6px',
      fontSize: '14px',
      textDecoration: canResend && isResendHovered ? 'underline' : 'none'
    },
    footerSection: {
      marginTop: '20px',
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
      gap: '6px'
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <span style={styles.logoText}>Dayflow</span>
          </div>
          <h1 style={styles.title}>Verify your email</h1>
          <p style={styles.subtitle}>
            We've sent a 6-digit code to <span style={styles.emailHighlight}>{email || 'your email'}</span>
          </p>
        </div>

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

        {successMessage && (
          <div style={styles.successBanner}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify} noValidate>
          <div style={styles.otpContainer}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                style={styles.otpInput(index)}
                disabled={isLoading}
              />
            ))}
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
                <span>Verifying code...</span>
              </>
            ) : (
              <span>Verify Email</span>
            )}
          </button>
        </form>

        <div style={styles.resendWrapper}>
          Didn't receive the code?
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isLoading}
            onMouseEnter={() => setIsResendHovered(true)}
            onMouseLeave={() => setIsResendHovered(false)}
            style={styles.resendBtn}
          >
            {canResend ? 'Resend code' : `Resend in ${cooldown}s`}
          </button>
        </div>

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
