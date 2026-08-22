import React, { useState, useEffect } from 'react';

/**
 * EmployeeDashboard.jsx - Dayflow HRMS (Deel Theme with Light/Dark Mode Switcher)
 * 
 * Features from PDF Spec:
 * - Quick-access cards: Profile, Attendance, Leave Requests, Logout
 * - Recent activity / alerts feed (Notification Service /api/notifications/me)
 * - Check-in / Check-out widget with live digital timestamp
 * - Leave balance summary card (Paid / Sick / Unpaid remaining)
 * - Theme Switcher (Dark / Light Theme)
 * - Bootstrap SVG Icons
 * - 100% INLINE CSS ONLY
 * 
 * Props:
 * - apiBaseUrl: String (optional)
 * - onNavigate: Function(pageName) (optional callback for switching views)
 * - onLogout: Function() (optional callback for logout)
 */
export default function EmployeeDashboard({
  apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  onNavigate,
  onLogout
}) {
  // Theme state: 'dark' (default) or 'light'
  const [theme, setTheme] = useState('dark');

  // User details from localStorage or props
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dayflow_user');
    return stored ? JSON.parse(stored) : { email: 'employee@company.com', employeeId: 'EMP-1001', role: 'EMPLOYEE' };
  });

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Attendance Check-in State
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Leave Balances State (defaults / fetched from API)
  const [leaveBalances, setLeaveBalances] = useState({
    paid: { remaining: 9, total: 12 },
    sick: { remaining: 8, total: 10 },
    unpaid: { remaining: 5, total: 5 }
  });

  // Notifications / Activity Feed State
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'LEAVE', message: 'Your Paid Leave request for Aug 28 was Approved by HR.', time: '2 hours ago', unread: true },
    { id: 2, type: 'PAYROLL', message: 'July Salary Slip is now available for download.', time: '1 day ago', unread: true },
    { id: 3, type: 'SYSTEM', message: 'System Maintenance scheduled for Sunday at 02:00 AM UTC.', time: '3 days ago', unread: false }
  ]);

  // Hover states for interactive UI
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // Ticking Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial notifications from backend API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('dayflow_token');
        const res = await fetch(`${apiBaseUrl}/api/notifications/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setNotifications(data);
        }
      } catch (err) {
        // Fallback to initial mock state if backend not connected yet
      }
    };
    fetchNotifications();
  }, [apiBaseUrl]);

  // Check-in / Check-out Handler
  const handleAttendanceToggle = async () => {
    setAttendanceLoading(true);
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const token = localStorage.getItem('dayflow_token');

    try {
      if (!isCheckedIn) {
        // Trigger Check-in
        const res = await fetch(`${apiBaseUrl}/api/attendance/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ timestamp: now.toISOString() })
        }).catch(() => null);

        setIsCheckedIn(true);
        setCheckInTime(formattedTime);
        setCheckOutTime(null);
      } else {
        // Trigger Check-out
        const res = await fetch(`${apiBaseUrl}/api/attendance/check-out`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ timestamp: now.toISOString() })
        }).catch(() => null);

        setIsCheckedIn(false);
        setCheckOutTime(formattedTime);
      }
    } finally {
      setAttendanceLoading(false);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Color Palette Definitions (Dark vs Light)
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#000000' : '#F8FAFC',
    cardBg: isDark ? '#0A0A0A' : '#FFFFFF',
    border: isDark ? '#262626' : '#E2E8F0',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#A1A1AA' : '#64748B',
    accentBtnBg: isDark ? '#FFFFFF' : '#0F172A',
    accentBtnText: isDark ? '#000000' : '#FFFFFF',
    accentBtnHover: isDark ? '#E4E4E7' : '#1E293B',
    badgeBg: isDark ? '#18181B' : '#F1F5F9',
    badgeText: isDark ? '#E4E4E7' : '#334155',
    successBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
    successText: isDark ? '#34D399' : '#15803D',
    warningBg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
    warningText: isDark ? '#FBBF24' : '#B45309'
  };

  // ==========================================
  // INLINE STYLES
  // ==========================================
  const styles = {
    dashboardContainer: {
      minHeight: '100vh',
      width: '100%',
      backgroundColor: colors.bg,
      color: colors.textPrimary,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxSizing: 'border-box',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    },
    navBar: {
      height: '70px',
      borderBottom: `1px solid ${colors.border}`,
      backgroundColor: colors.cardBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    brandWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoBadge: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      backgroundColor: colors.textPrimary,
      color: colors.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '800'
    },
    brandText: {
      fontSize: '20px',
      fontWeight: '800',
      letterSpacing: '-0.5px',
      color: colors.textPrimary
    },
    navActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    themeToggleBtn: {
      background: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      color: colors.textPrimary,
      borderRadius: '20px',
      padding: '6px 14px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    userChip: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '4px 12px',
      borderRadius: '20px',
      backgroundColor: colors.badgeBg,
      border: `1px solid ${colors.border}`
    },
    avatar: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: colors.textPrimary,
      color: colors.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700'
    },
    logoutBtn: {
      background: 'none',
      border: `1px solid ${colors.border}`,
      color: colors.textSecondary,
      borderRadius: '8px',
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease'
    },
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '32px 24px',
      boxSizing: 'border-box'
    },
    welcomeBanner: {
      marginBottom: '32px'
    },
    welcomeTitle: {
      fontSize: '28px',
      fontWeight: '800',
      margin: '0 0 6px 0',
      letterSpacing: '-0.5px'
    },
    welcomeSub: {
      fontSize: '14px',
      color: colors.textSecondary,
      margin: 0
    },

    // Quick-Access Cards Grid
    quickGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    quickCard: (id) => ({
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '24px',
      cursor: 'pointer',
      boxShadow: hoveredCard === id ? '0 12px 24px -10px rgba(0, 0, 0, 0.2)' : 'none',
      transform: hoveredCard === id ? 'translateY(-2px)' : 'none',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }),
    quickHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    quickIconWrapper: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      backgroundColor: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: colors.textPrimary
    },
    quickTitle: {
      fontSize: '16px',
      fontWeight: '700',
      margin: '0 0 4px 0'
    },
    quickDesc: {
      fontSize: '13px',
      color: colors.textSecondary,
      margin: 0
    },

    // Two-Column Main Layout
    layoutTwoCol: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px'
    },

    // Widgets Card
    widgetCard: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: '28px',
      marginBottom: '24px',
      boxSizing: 'border-box'
    },
    widgetHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px'
    },
    widgetTitle: {
      fontSize: '18px',
      fontWeight: '700',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },

    // Check-In Widget Specifics
    clockDisplay: {
      fontSize: '36px',
      fontWeight: '800',
      letterSpacing: '1px',
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'center',
      margin: '16px 0 8px 0',
      color: colors.textPrimary
    },
    dateDisplay: {
      textAlign: 'center',
      fontSize: '13px',
      color: colors.textSecondary,
      marginBottom: '24px'
    },
    statusPill: (active) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      backgroundColor: active ? colors.successBg : colors.badgeBg,
      color: active ? colors.successText : colors.textSecondary,
      marginBottom: '20px'
    }),
    checkInBtn: {
      width: '100%',
      padding: '14px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: isCheckedIn ? '#EF4444' : colors.accentBtnBg,
      color: isCheckedIn ? '#FFFFFF' : colors.accentBtnText,
      fontSize: '15px',
      fontWeight: '700',
      cursor: attendanceLoading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },

    // Leave Summary Specifics
    leaveProgressGroup: {
      marginBottom: '16px'
    },
    leaveLabelRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '6px'
    },
    leaveTrack: {
      height: '8px',
      width: '100%',
      backgroundColor: colors.badgeBg,
      borderRadius: '4px',
      overflow: 'hidden'
    },
    leaveFill: (percent, color) => ({
      height: '100%',
      width: `${percent}%`,
      backgroundColor: color,
      borderRadius: '4px',
      transition: 'width 0.4s ease'
    }),

    // Notification Feed Specifics
    notifItem: (unread) => ({
      padding: '14px 16px',
      borderRadius: '12px',
      backgroundColor: unread ? (isDark ? '#141416' : '#F1F5F9') : 'transparent',
      border: `1px solid ${unread ? colors.border : 'transparent'}`,
      marginBottom: '10px',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }),
    notifMessage: {
      fontSize: '13px',
      color: colors.textPrimary,
      lineHeight: '1.4',
      margin: '0 0 4px 0'
    },
    notifTime: {
      fontSize: '11px',
      color: colors.textSecondary
    },
    markReadBtn: {
      background: 'none',
      border: 'none',
      fontSize: '12px',
      fontWeight: '600',
      color: colors.textSecondary,
      cursor: 'pointer',
      padding: 0
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* Top Navbar */}
      <header style={styles.navBar}>
        <div style={styles.brandWrapper}>
          <div style={styles.logoBadge}>
            {/* Bootstrap Icon: bi-person-workspace */}
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 16s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H4Zm4-5.95a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
              <path d="M2 1a2 2 0 0 0-2 2v9.5A1.5 1.5 0 0 0 1.5 14h.558a6 6 0 0 1 1.874-2.222A4.993 4.993 0 0 1 1.05 9.05a.5.5 0 0 1 .9-.434 3.993 3.993 0 0 0 6.1 0 .5.5 0 0 1 .9.434 4.993 4.993 0 0 1-2.882 2.728A6 6 0 0 1 8 14h6.5a1.5 1.5 0 0 0 1.5-1.5V3a2 2 0 0 0-2-2H2Z"/>
            </svg>
          </div>
          <span style={styles.brandText}>Dayflow</span>
        </div>

        <div style={styles.navActions}>
          {/* Light / Dark Mode Switcher */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={styles.themeToggleBtn}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <>
                {/* Bootstrap Icon: bi-sun-fill */}
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                {/* Bootstrap Icon: bi-moon-stars-fill */}
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>

          {/* User Profile Pill */}
          <div style={styles.userChip}>
            <div style={styles.avatar}>
              {user.email ? user.email.charAt(0).toUpperCase() : 'E'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>
              {user.employeeId || 'EMP-1001'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => onLogout ? onLogout() : window.location.reload()}
            style={styles.logoutBtn}
          >
            {/* Bootstrap Icon: bi-box-arrow-right */}
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
              <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main style={styles.mainContent}>
        {/* Welcome Section */}
        <div style={styles.welcomeBanner}>
          <h1 style={styles.welcomeTitle}>
            Welcome back, {user.email ? user.email.split('@')[0] : 'Employee'} 👋
          </h1>
          <p style={styles.welcomeSub}>
            Here is your daily workspace snapshot for {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Top Quick-Access Cards Grid (4 PDF Spec Features) */}
        <div style={styles.quickGrid}>
          {/* Card 1: Profile */}
          <div
            onClick={() => onNavigate && onNavigate('profile')}
            onMouseEnter={() => setHoveredCard('profile')}
            onMouseLeave={() => setHoveredCard(null)}
            style={styles.quickCard('profile')}
          >
            <div style={styles.quickHeader}>
              <div style={styles.quickIconWrapper}>
                {/* Bootstrap Icon: bi-person-badge */}
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path d="M4.5 0A1.5 1.5 0 0 0 3 1.5v13A1.5 1.5 0 0 0 4.5 16h7a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 11.5 0h-7zM4 1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-13z"/>
                </svg>
              </div>
              <span style={{ fontSize: '12px', color: colors.textSecondary }}>View Profile →</span>
            </div>
            <div>
              <h3 style={styles.quickTitle}>My Profile</h3>
              <p style={styles.quickDesc}>Personal, job & salary details</p>
            </div>
          </div>

          {/* Card 2: Attendance */}
          <div
            onClick={() => onNavigate && onNavigate('attendance')}
            onMouseEnter={() => setHoveredCard('attendance')}
            onMouseLeave={() => setHoveredCard(null)}
            style={styles.quickCard('attendance')}
          >
            <div style={styles.quickHeader}>
              <div style={styles.quickIconWrapper}>
                {/* Bootstrap Icon: bi-calendar-check */}
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h9V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>
              </div>
              <span style={{ fontSize: '12px', color: isCheckedIn ? colors.successText : colors.textSecondary }}>
                {isCheckedIn ? '● Checked In' : 'Attendance Log →'}
              </span>
            </div>
            <div>
              <h3 style={styles.quickTitle}>Attendance</h3>
              <p style={styles.quickDesc}>Daily logs & weekly history</p>
            </div>
          </div>

          {/* Card 3: Leave Requests */}
          <div
            onClick={() => onNavigate && onNavigate('leave')}
            onMouseEnter={() => setHoveredCard('leave')}
            onMouseLeave={() => setHoveredCard(null)}
            style={styles.quickCard('leave')}
          >
            <div style={styles.quickHeader}>
              <div style={styles.quickIconWrapper}>
                {/* Bootstrap Icon: bi-card-checklist */}
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
                  <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
                </svg>
              </div>
              <span style={{ fontSize: '12px', color: colors.textSecondary }}>Apply Leave →</span>
            </div>
            <div>
              <h3 style={styles.quickTitle}>Leave Requests</h3>
              <p style={styles.quickDesc}>Apply leave & track status</p>
            </div>
          </div>

          {/* Card 4: Payroll */}
          <div
            onClick={() => onNavigate && onNavigate('payroll')}
            onMouseEnter={() => setHoveredCard('payroll')}
            onMouseLeave={() => setHoveredCard(null)}
            style={styles.quickCard('payroll')}
          >
            <div style={styles.quickHeader}>
              <div style={styles.quickIconWrapper}>
                {/* Bootstrap Icon: bi-cash-stack */}
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                  <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
                </svg>
              </div>
              <span style={{ fontSize: '12px', color: colors.textSecondary }}>Pay Slips →</span>
            </div>
            <div>
              <h3 style={styles.quickTitle}>Payroll</h3>
              <p style={styles.quickDesc}>Salary slips & payment history</p>
            </div>
          </div>
        </div>

        {/* Two-Column Dashboard Widgets */}
        <div style={styles.layoutTwoCol}>
          {/* LEFT COLUMN */}
          <div>
            {/* Live Check-In / Check-Out Widget */}
            <div style={styles.widgetCard}>
              <div style={styles.widgetHeader}>
                <h2 style={styles.widgetTitle}>
                  {/* Bootstrap Icon: bi-clock-history */}
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.806-.547l.453-.892c.338.172.66.368.966.588l-.613.851zm1.18.968a7.027 7.027 0 0 0-.586-.77l.666-.745c.298.267.577.555.836.862l-.916.653zm.88 1.258a7.03 7.03 0 0 0-.348-.925l.84-.544c.2.31.376.633.528.968l-.974.316zM15 8a7.002 7.002 0 0 0-.019-.515l.997-.074A8 8 0 0 1 16 8h-1zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                  </svg>
                  Live Timestamp Check-In
                </h2>
                <div style={styles.statusPill(isCheckedIn)}>
                  <span style={{ fontSize: '8px' }}>●</span>
                  <span>{isCheckedIn ? 'Checked In' : 'Not Checked In'}</span>
                </div>
              </div>

              <div style={styles.clockDisplay}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div style={styles.dateDisplay}>
                {checkInTime ? `Checked in at ${checkInTime}` : 'Tap below to record your check-in timestamp'}
              </div>

              <button
                type="button"
                onClick={handleAttendanceToggle}
                disabled={attendanceLoading}
                style={styles.checkInBtn}
              >
                {/* Bootstrap Icon: bi-box-arrow-in-right */}
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"/>
                  <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
                <span>{isCheckedIn ? 'Check Out Now' : 'Check In Now'}</span>
              </button>
            </div>

            {/* Leave Balance Summary Card */}
            <div style={styles.widgetCard}>
              <div style={styles.widgetHeader}>
                <h2 style={styles.widgetTitle}>
                  {/* Bootstrap Icon: bi-briefcase */}
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3h-4v-.5a.5.5 0 0 1 .5-.5zM0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a2.5 2.5 0 0 1-1.258 0L0 6.85v5.65z"/>
                  </svg>
                  Leave Balance Summary
                </h2>
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>Annual Quota</span>
              </div>

              {/* Paid Leave */}
              <div style={styles.leaveProgressGroup}>
                <div style={styles.leaveLabelRow}>
                  <span>Paid Leave</span>
                  <span>{leaveBalances.paid.remaining} / {leaveBalances.paid.total} Days Left</span>
                </div>
                <div style={styles.leaveTrack}>
                  <div style={styles.leaveFill((leaveBalances.paid.remaining / leaveBalances.paid.total) * 100, '#34D399')} />
                </div>
              </div>

              {/* Sick Leave */}
              <div style={styles.leaveProgressGroup}>
                <div style={styles.leaveLabelRow}>
                  <span>Sick Leave</span>
                  <span>{leaveBalances.sick.remaining} / {leaveBalances.sick.total} Days Left</span>
                </div>
                <div style={styles.leaveTrack}>
                  <div style={styles.leaveFill((leaveBalances.sick.remaining / leaveBalances.sick.total) * 100, '#60A5FA')} />
                </div>
              </div>

              {/* Unpaid Leave */}
              <div style={{ marginBottom: '8px' }}>
                <div style={styles.leaveLabelRow}>
                  <span>Unpaid Leave Used</span>
                  <span>{leaveBalances.unpaid.remaining} Days</span>
                </div>
                <div style={styles.leaveTrack}>
                  <div style={styles.leaveFill(100, '#A1A1AA')} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Recent Activity / Alerts Feed */}
            <div style={styles.widgetCard}>
              <div style={styles.widgetHeader}>
                <h2 style={styles.widgetTitle}>
                  {/* Bootstrap Icon: bi-bell */}
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                  </svg>
                  Activity & Alerts Feed
                </h2>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  style={styles.markReadBtn}
                >
                  Mark read
                </button>
              </div>

              <div>
                {notifications.map((item) => (
                  <div key={item.id} style={styles.notifItem(item.unread)}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: item.unread ? colors.textPrimary : 'transparent',
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={styles.notifMessage}>{item.message}</p>
                      <span style={styles.notifTime}>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
