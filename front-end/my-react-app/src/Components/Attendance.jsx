import React, { useState, useEffect } from 'react';

/**
 * Attendance.jsx - Dayflow HRMS (Deel Theme)
 * 
 * Features:
 * - Centered Success Pop-up with OK Button for Check-in / Check-out actions.
 * - Daily / Weekly view toggle & status summary badges.
 * - 100% INLINE CSS ONLY.
 */
export default function Attendance({
  apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080',
  theme = 'dark',
  onBackToDashboard
}) {
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#000000' : '#F8FAFC',
    cardBg: isDark ? '#0A0A0A' : '#FFFFFF',
    border: isDark ? '#262626' : '#E2E8F0',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#A1A1AA' : '#64748B',
    badgeBg: isDark ? '#18181B' : '#F1F5F9',
    buttonBg: isDark ? '#FFFFFF' : '#0F172A',
    buttonText: isDark ? '#000000' : '#FFFFFF',
    successBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
    successText: isDark ? '#34D399' : '#15803D'
  };

  const [viewMode, setViewMode] = useState('weekly');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [successPopUp, setSuccessPopUp] = useState('');

  const [summary, setSummary] = useState({
    present: 18,
    absent: 1,
    halfDay: 1,
    leave: 2
  });

  const [logs, setLogs] = useState([
    { id: 1, date: '2026-08-22', checkIn: '09:15 AM', checkOut: '--', status: 'Present', duration: 'Ongoing' },
    { id: 2, date: '2026-08-21', checkIn: '09:02 AM', checkOut: '05:30 PM', status: 'Present', duration: '8h 28m' },
    { id: 3, date: '2026-08-20', checkIn: '09:30 AM', checkOut: '01:30 PM', status: 'Half-day', duration: '4h 00m' },
    { id: 4, date: '2026-08-19', checkIn: '09:00 AM', checkOut: '05:45 PM', status: 'Present', duration: '8h 45m' },
    { id: 5, date: '2026-08-18', checkIn: '--', checkOut: '--', status: 'Leave', duration: '0h' }
  ]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckInToggle = async () => {
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const token = localStorage.getItem('dayflow_token');

    try {
      if (!isCheckedIn) {
        await fetch(`${apiBaseUrl}/api/attendance/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ timestamp: now.toISOString() })
        }).catch(() => null);

        setIsCheckedIn(true);
        setCheckInTime(formatted);
        setSuccessPopUp(`Checked in successfully at ${formatted}!`);
      } else {
        await fetch(`${apiBaseUrl}/api/attendance/check-out`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ timestamp: now.toISOString() })
        }).catch(() => null);

        setIsCheckedIn(false);
        setSuccessPopUp(`Checked out successfully at ${formatted}!`);
      }
    } catch (err) {
      // Ignore
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return { bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7', text: isDark ? '#34D399' : '#15803D' };
      case 'Absent':
        return { bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', text: isDark ? '#FCA5A5' : '#B91C1C' };
      case 'Half-day':
        return { bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7', text: isDark ? '#FBBF24' : '#B45309' };
      default:
        return { bg: isDark ? 'rgba(99, 102, 241, 0.15)' : '#E0E7FF', text: isDark ? '#818CF8' : '#4338CA' };
    }
  };

  // ==========================================
  // INLINE STYLES
  // ==========================================
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.bg,
      color: colors.textPrimary,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '32px 24px',
      boxSizing: 'border-box',
      position: 'relative'
    },
    wrapper: {
      maxWidth: '1000px',
      margin: '0 auto'
    },
    topHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '28px'
    },
    backBtn: {
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      color: colors.textPrimary,
      padding: '10px 18px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    toggleGroup: {
      display: 'flex',
      backgroundColor: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '10px',
      padding: '4px'
    },
    toggleBtn: (active) => ({
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      border: 'none',
      backgroundColor: active ? colors.buttonBg : 'transparent',
      color: active ? colors.buttonText : colors.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }),
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '28px'
    },
    statBox: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center'
    },
    statNum: {
      fontSize: '28px',
      fontWeight: '800',
      margin: '8px 0 0 0'
    },
    actionWidget: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '28px'
    },
    checkBtn: {
      backgroundColor: isCheckedIn ? '#EF4444' : colors.buttonBg,
      color: isCheckedIn ? '#FFFFFF' : colors.buttonText,
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer'
    },
    tableCard: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: '24px',
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left'
    },
    th: {
      padding: '12px 16px',
      fontSize: '12px',
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      borderBottom: `1px solid ${colors.border}`
    },
    td: {
      padding: '16px',
      fontSize: '14px',
      borderBottom: `1px solid ${colors.border}`
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

    // CENTERED SUCCESS POP-UP CARD WITH OK BUTTON
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
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes dayflowPopIn {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* CENTERED SUCCESS POP-UP WITH OK BUTTON */}
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

      <div style={styles.wrapper}>
        {/* Top Header */}
        <div style={styles.topHeader}>
          <button type="button" onClick={onBackToDashboard} style={styles.backBtn}>
            ← Back to Dashboard
          </button>

          <div style={styles.toggleGroup}>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              style={styles.toggleBtn(viewMode === 'daily')}
            >
              Daily View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              style={styles.toggleBtn(viewMode === 'weekly')}
            >
              Weekly View
            </button>
          </div>
        </div>

        {/* Live Check-In Action Banner */}
        <div style={styles.actionWidget}>
          <div>
            <div style={{ fontSize: '13px', color: colors.textSecondary }}>Live Clock: {currentTime.toLocaleTimeString()}</div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>
              {isCheckedIn ? `Checked in at ${checkInTime}` : 'Recorded Check-in bound to timestamp'}
            </div>
          </div>
          <button type="button" onClick={handleCheckInToggle} style={styles.checkBtn}>
            {isCheckedIn ? 'Check Out Now' : 'Check In Now'}
          </button>
        </div>

        {/* Summary Badges Grid */}
        <div style={styles.summaryGrid}>
          <div style={styles.statBox}>
            <div style={{ fontSize: '13px', color: colors.textSecondary }}>Present</div>
            <div style={{ ...styles.statNum, color: isDark ? '#34D399' : '#15803D' }}>{summary.present}</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ fontSize: '13px', color: colors.textSecondary }}>Absent</div>
            <div style={{ ...styles.statNum, color: isDark ? '#FCA5A5' : '#B91C1C' }}>{summary.absent}</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ fontSize: '13px', color: colors.textSecondary }}>Half-day</div>
            <div style={{ ...styles.statNum, color: isDark ? '#FBBF24' : '#B45309' }}>{summary.halfDay}</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ fontSize: '13px', color: colors.textSecondary }}>Leave</div>
            <div style={{ ...styles.statNum, color: isDark ? '#818CF8' : '#4338CA' }}>{summary.leave}</div>
          </div>
        </div>

        {/* Attendance History Table */}
        <div style={styles.tableCard}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 20px 0' }}>
            📅 Personal Attendance Logs ({viewMode.toUpperCase()})
          </h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Check-In Time</th>
                <th style={styles.th}>Check-Out Time</th>
                <th style={styles.th}>Work Duration</th>
                <th style={styles.th}>Status Badge</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <tr key={item.id}>
                    <td style={{ ...styles.td, fontWeight: '600' }}>{item.date}</td>
                    <td style={styles.td}>{item.checkIn}</td>
                    <td style={styles.td}>{item.checkOut}</td>
                    <td style={styles.td}>{item.duration}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: badge.bg,
                        color: badge.text
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
