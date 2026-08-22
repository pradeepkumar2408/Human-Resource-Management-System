import React, { useState, useEffect } from 'react';

/**
 * EmployeeDashboard.jsx - Dayflow HRMS (Deel Theme)
 * 
 * Features:
 * - Immediate Click Responses: Instant state updates on button clicks (optimistic UI feedback).
 * - Navbar Notification Bell with unread badge counter (🔴 3).
 * - Immediate Notification Grid dropdown toggle & navigation.
 * - Persistent Light/Dark Global Theme Switcher.
 * - Balanced 2-Column Dashboard (Live Timestamp Check-In + Leave Balance Summary).
 * - Quick Access Cards: Profile, Attendance, Leave Requests, Payroll.
 * - Centered Success Pop-up with OK Button.
 * - 100% INLINE CSS ONLY.
 */
export default function EmployeeDashboard({
  apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  theme = 'dark',
  onToggleTheme,
  onNavigate,
  onLogout
}) {
  const isDark = theme === 'dark';

  // Screen size state
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // User details from localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dayflow_user');
    return stored ? JSON.parse(stored) : { email: '', employeeId: '', role: 'EMPLOYEE' };
  });

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Attendance Check-in State
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  // Notification Bell Dropdown Panel Open/Close state
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Centered Success Pop-Up State
  const [successPopUp, setSuccessPopUp] = useState('');

  // Leave Balances State (fetched from DB)
  const [leaveBalances, setLeaveBalances] = useState({
    paid: { remaining: 0, total: 0 },
    sick: { remaining: 0, total: 0 },
    unpaid: { remaining: 0, total: 0 }
  });

  // Notifications State (fetched from DB)
  const [notifications, setNotifications] = useState([]);

  // Hover states for interactive UI
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // Live Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user profile from backend on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const empId = user?.employeeId || '';
        if (!empId) return;
        const token = localStorage.getItem('dayflow_token');
        const res = await fetch(`${apiBaseUrl}/api/employees/${empId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setUser((prev) => ({
              ...prev,
              firstName: data.firstName || prev.firstName,
              lastName: data.lastName || prev.lastName,
              email: data.email || prev.email
            }));
          }
        }
      } catch (err) { /* silent */ }
    };
    fetchUserProfile();
  }, [apiBaseUrl]);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const empId = user?.employeeId || '';
        if (!empId) return;
        const token = localStorage.getItem('dayflow_token');
        const res = await fetch(`${apiBaseUrl}/api/notifications/me?employeeId=${empId}`, {
          headers: { Authorization: `Bearer ${token}`, 'X-Employee-Id': empId }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setNotifications(data);
        }
      } catch (err) { /* silent */ }
    };
    fetchNotifications();
  }, [apiBaseUrl, user]);

  // Fetch leave balances from backend
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const empId = user?.employeeId || '';
        if (!empId) return;
        const token = localStorage.getItem('dayflow_token');
        const res = await fetch(`${apiBaseUrl}/api/leaves/me?employeeId=${empId}`, {
          headers: { Authorization: `Bearer ${token}`, 'X-Employee-Id': empId }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const paid = data.filter(l => (l.leaveTypeName || l.type || l.leaveType || '').toLowerCase().includes('paid'));
            const sick = data.filter(l => (l.leaveTypeName || l.type || l.leaveType || '').toLowerCase().includes('sick'));
            setLeaveBalances({
              paid: { remaining: Math.max(0, 12 - paid.filter(l => l.status !== 'REJECTED' && l.status !== 'Rejected').length), total: 12 },
              sick: { remaining: Math.max(0, 10 - sick.filter(l => l.status !== 'REJECTED' && l.status !== 'Rejected').length), total: 10 },
              unpaid: { remaining: 5, total: 5 }
            });
          }
        }
      } catch (err) { /* silent */ }
    };
    fetchLeaveBalances();
  }, [apiBaseUrl, user]);

  // Check today's attendance status from DB to restore check-in state on page load
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const empId = user?.employeeId || '';
        if (!empId) return;
        const token = localStorage.getItem('dayflow_token');
        const res = await fetch(`${apiBaseUrl}/api/attendance/me?employeeId=${empId}`, {
          headers: { Authorization: `Bearer ${token}`, 'X-Employee-Id': empId }
        });
        if (res.ok) {
          const data = await res.json();
          const today = new Date().toISOString().split('T')[0];
          const todayRecord = Array.isArray(data) ? data.find(r => {
            const d = r.workDate || r.date || r.attendanceDate || '';
            return d.toString().startsWith(today);
          }) : null;
          if (todayRecord) {
            const hasCheckIn = todayRecord.checkIn;
            const hasCheckOut = todayRecord.checkOut;
            if (hasCheckIn && !hasCheckOut) {
              setIsCheckedIn(true);
              const timeStr = new Date(hasCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              setCheckInTime(timeStr);
            } else if (hasCheckIn && hasCheckOut) {
              setIsCheckedIn(false); // Already checked out today
            }
          }
        }
      } catch (err) { /* silent */ }
    };
    fetchTodayAttendance();
  }, [apiBaseUrl, user]);

  // Immediate Click Handler for Attendance Check-In / Check-Out
  const handleAttendanceToggle = async () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const empId = user?.employeeId || '';
    const token = localStorage.getItem('dayflow_token');

    // Optimistic UI update
    if (!isCheckedIn) {
      setIsCheckedIn(true);
      setCheckInTime(formattedTime);
      setSuccessPopUp(`Checked in successfully at ${formattedTime}!`);
    } else {
      setIsCheckedIn(false);
      setSuccessPopUp(`Checked out successfully at ${formattedTime}!`);
    }

    // API Call with employeeId in body
    const endpoint = !isCheckedIn ? '/api/attendance/check-in' : '/api/attendance/check-out';
    try {
      await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'X-Employee-Id': empId },
        body: JSON.stringify({ employeeId: empId })
      });
    } catch (err) { /* silent */ }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Colors based on global theme
  const colors = {
    bg: isDark ? '#000000' : '#F8FAFC',
    cardBg: isDark ? '#0A0A0A' : '#FFFFFF',
    border: isDark ? '#262626' : '#E2E8F0',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#A1A1AA' : '#64748B',
    accentBtnBg: isDark ? '#FFFFFF' : '#0F172A',
    accentBtnText: isDark ? '#000000' : '#FFFFFF',
    badgeBg: isDark ? '#18181B' : '#F1F5F9',
    successBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
    successText: isDark ? '#34D399' : '#15803D'
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
      position: 'relative',
      animation: 'dayflowFadeIn 0.25s ease-out'
    },
    navBar: {
      height: '70px',
      borderBottom: `1px solid ${colors.border}`,
      backgroundColor: colors.cardBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 32px',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'background-color 0.2s ease, border-color 0.2s ease'
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
      gap: '16px',
      position: 'relative'
    },
    notifBellBtn: {
      background: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      color: colors.textPrimary,
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      position: 'relative',
      transition: 'transform 0.15s ease, background-color 0.15s ease',
      transform: hoveredBtn === 'bell' ? 'scale(1.08)' : 'scale(1)'
    },
    unreadBadge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
      borderRadius: '50%',
      fontSize: '11px',
      fontWeight: '800',
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${colors.cardBg}`
    },
    notifDropdown: {
      position: 'absolute',
      top: '52px',
      right: '120px',
      width: '340px',
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      zIndex: 200,
      display: isNotifOpen ? 'block' : 'none',
      animation: 'dayflowPopIn 0.2s ease'
    },
    themeToggleBtn: {
      background: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      color: colors.textPrimary,
      borderRadius: '20px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.15s ease',
      transform: hoveredBtn === 'theme' ? 'scale(1.05)' : 'scale(1)'
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
      padding: '8px 14px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.15s ease',
      transform: hoveredBtn === 'logout' ? 'scale(1.03)' : 'scale(1)'
    },
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: isMobile ? '20px 16px' : '32px 24px',
      boxSizing: 'border-box'
    },
    welcomeBanner: {
      marginBottom: '32px'
    },
    welcomeTitle: {
      fontSize: isMobile ? '22px' : '28px',
      fontWeight: '800',
      margin: '0 0 6px 0',
      letterSpacing: '-0.5px'
    },
    welcomeSub: {
      fontSize: '14px',
      color: colors.textSecondary,
      margin: 0
    },
    quickGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: isMobile ? '12px' : '20px',
      marginBottom: '32px'
    },
    quickCard: (id) => ({
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      cursor: 'pointer',
      boxShadow: hoveredCard === id ? '0 12px 24px -10px rgba(0, 0, 0, 0.25)' : 'none',
      transform: hoveredCard === id ? 'translateY(-4px)' : 'translateY(0)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
      width: '42px',
      height: '42px',
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
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: '700',
      margin: '0 0 4px 0'
    },
    quickDesc: {
      fontSize: '12px',
      color: colors.textSecondary,
      margin: 0
    },
    layoutTwoCol: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '24px'
    },
    widgetCard: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: isMobile ? '20px' : '28px',
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
    clockDisplay: {
      fontSize: isMobile ? '30px' : '36px',
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
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: hoveredBtn === 'checkin' ? 'scale(1.02)' : 'scale(1)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
    },
    leaveProgressGroup: {
      marginBottom: '20px'
    },
    leaveLabelRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '8px'
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
      transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    }),
    notifItem: (unread) => ({
      padding: '12px 14px',
      borderRadius: '10px',
      backgroundColor: unread ? (isDark ? '#141416' : '#F1F5F9') : 'transparent',
      border: `1px solid ${unread ? colors.border : 'transparent'}`,
      marginBottom: '8px',
      display: 'flex',
      gap: '10px',
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

    // BACKDROP OVERLAY
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '24px'
    },

    // CENTERED SUCCESS POP-UP CARD WITH INSTANT OK BUTTON
    popUpCard: {
      backgroundColor: colors.cardBg,
      border: `2px solid ${isDark ? '#34D399' : '#10B981'}`,
      borderRadius: '24px',
      padding: '32px 28px',
      maxWidth: '380px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      animation: 'dayflowPopIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    checkBadge: {
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      backgroundColor: colors.successBg,
      color: colors.successText,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '26px',
      fontWeight: '800'
    },
    okButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'transform 0.15s ease'
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <style>{`
        @keyframes dayflowFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dayflowPopIn {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* CENTERED SUCCESS POP-UP WITH INSTANT OK BUTTON */}
      {successPopUp && (
        <div style={styles.modalBackdrop}>
          <div style={styles.popUpCard}>
            <div style={styles.checkBadge}>✓</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, lineHeight: '1.4' }}>
              {successPopUp}
            </div>
            <button
              type="button"
              onClick={() => setSuccessPopUp('')}
              style={styles.okButton}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header style={styles.navBar}>
        <div style={styles.brandWrapper}>
          <div style={styles.logoBadge}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 16s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H4Zm4-5.95a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
              <path d="M2 1a2 2 0 0 0-2 2v9.5A1.5 1.5 0 0 0 1.5 14h.558a6 6 0 0 1 1.874-2.222A4.993 4.993 0 0 1 1.05 9.05a.5.5 0 0 1 .9-.434 3.993 3.993 0 0 0 6.1 0 .5.5 0 0 1 .9.434 4.993 4.993 0 0 1-2.882 2.728A6 6 0 0 1 8 14h6.5a1.5 1.5 0 0 0 1.5-1.5V3a2 2 0 0 0-2-2H2Z"/>
            </svg>
          </div>
          <span style={styles.brandText}>Dayflow</span>
        </div>

        {/* Top Navbar Items */}
        <div style={styles.navActions}>
          {/* Notification Bell Button (Instant Toggle) */}
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            onMouseEnter={() => setHoveredBtn('bell')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={styles.notifBellBtn}
            title="Notifications Grid"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
            </svg>
            {unreadCount > 0 && <span style={styles.unreadBadge}>{unreadCount}</span>}
          </button>

          {/* Interactive Floating Notification Grid Dropdown Panel */}
          <div style={styles.notifDropdown}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>🔔 Notifications Grid</span>
              <button
                type="button"
                onClick={() => { setIsNotifOpen(false); if (onNavigate) onNavigate('notifications'); }}
                style={{ background: 'none', border: 'none', color: isDark ? '#60A5FA' : '#2563EB', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Open Full Grid →
              </button>
            </div>

            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} style={styles.notifItem(n.unread)}>
                <div style={{ flex: 1 }}>
                  <p style={styles.notifMessage}>{n.message}</p>
                  <span style={styles.notifTime}>{n.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Global Light/Dark Theme Switcher (Instant Response) */}
          <button
            type="button"
            onClick={onToggleTheme}
            onMouseEnter={() => setHoveredBtn('theme')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={styles.themeToggleBtn}
            title="Toggle Theme Across Entire App"
          >
            {isDark ? (
              <>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>

          {/* User Profile Chip */}
          <div style={styles.userChip}>
            <div style={styles.avatar}>
              {(user.firstName || user.email || 'E').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>
              {user.employeeId || 'EMP-1001'}
            </span>
          </div>

          {/* Logout Button (Instant Response) */}
          <button
            type="button"
            onClick={() => onLogout ? onLogout() : window.location.reload()}
            onMouseEnter={() => setHoveredBtn('logout')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={styles.logoutBtn}
          >
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
            Welcome back, {user.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : (user.email ? user.email.split('@')[0] : 'Employee')} 👋
          </h1>
          <p style={styles.welcomeSub}>
            Here is your daily workspace snapshot for {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Top Quick-Access Cards Grid (Instant Page Navigation) */}
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

        {/* 2-Column Main Layout */}
        <div style={styles.layoutTwoCol}>
          {/* Live Check-In Widget */}
          <div style={styles.widgetCard}>
            <div style={styles.widgetHeader}>
              <h2 style={styles.widgetTitle}>
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
              onMouseEnter={() => setHoveredBtn('checkin')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={styles.checkInBtn}
            >
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
            <div style={{ marginBottom: '4px' }}>
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
      </main>
    </div>
  );
}
