import React, { useState, useEffect } from 'react';

/**
 * Notifications.jsx - Dayflow HRMS (Deel Theme)
 * 
 * Features from PDF Spec (Page 5):
 * - List of alerts: leave approved/rejected, attendance flags, announcements
 * - Mark as read / clear all interactions
 * - Backend fetch: GET /api/notifications/me & PUT /api/notifications/{id}/read
 * - Supports Light & Dark themes
 * 
 * 100% INLINE CSS ONLY
 */
export default function Notifications({
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
    inputBg: isDark ? '#121212' : '#F1F5F9',
    badgeBg: isDark ? '#18181B' : '#F1F5F9',
    buttonBg: isDark ? '#FFFFFF' : '#0F172A',
    buttonText: isDark ? '#000000' : '#FFFFFF'
  };

  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UNREAD', 'LEAVE', 'ATTENDANCE', 'ANNOUNCEMENT'
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'LEAVE', title: 'Leave Approved', message: 'Your Paid Leave request for Aug 28 - Aug 29 was Approved by HR.', time: '2 hours ago', unread: true },
    { id: 2, type: 'PAYROLL', title: 'Salary Slip Available', message: 'July 2026 Salary Slip is now ready to view & download in Payroll.', time: '1 day ago', unread: true },
    { id: 3, type: 'ATTENDANCE', title: 'Attendance Alert', message: 'Remember to check-in on time today before 09:30 AM.', time: '2 days ago', unread: true },
    { id: 4, type: 'ANNOUNCEMENT', title: 'Company Announcement', message: 'Quarterly All-Hands meeting scheduled for Friday at 3:00 PM UTC.', time: '3 days ago', unread: false },
    { id: 5, type: 'SYSTEM', title: 'System Update', message: 'Dayflow HRMS platform updated to v2.4 with improved notification grid.', time: '5 days ago', unread: false }
  ]);

  // Fetch from backend API
  useEffect(() => {
    const fetchNotifs = async () => {
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
        // Fallback
      }
    };
    fetchNotifs();
  }, [apiBaseUrl]);

  const handleMarkAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n));
    try {
      const token = localStorage.getItem('dayflow_token');
      await fetch(`${apiBaseUrl}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => null);
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return n.unread;
    if (filter === 'LEAVE') return n.type === 'LEAVE';
    if (filter === 'ATTENDANCE') return n.type === 'ATTENDANCE';
    if (filter === 'ANNOUNCEMENT') return n.type === 'ANNOUNCEMENT';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LEAVE':
        return '📝';
      case 'PAYROLL':
        return '💵';
      case 'ATTENDANCE':
        return '⏱️';
      case 'ANNOUNCEMENT':
        return '📢';
      default:
        return '🔔';
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
      transition: 'background-color 0.3s ease'
    },
    wrapper: {
      maxWidth: '900px',
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
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    actionBtn: {
      background: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      color: colors.textPrimary,
      padding: '8px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    filterBar: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      overflowX: 'auto',
      paddingBottom: '4px'
    },
    filterPill: (active) => ({
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      border: `1px solid ${active ? colors.textPrimary : colors.border}`,
      backgroundColor: active ? colors.buttonBg : colors.cardBg,
      color: active ? colors.buttonText : colors.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    }),
    gridCard: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: '24px',
      boxSizing: 'border-box'
    },
    notifCard: (unread) => ({
      padding: '18px 20px',
      borderRadius: '14px',
      backgroundColor: unread ? (isDark ? '#121214' : '#F1F5F9') : 'transparent',
      border: `1px solid ${unread ? colors.border : 'transparent'}`,
      marginBottom: '12px',
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      transition: 'all 0.2s ease'
    }),
    iconBadge: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      backgroundColor: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      flexShrink: 0
    },
    notifTitle: {
      fontSize: '15px',
      fontWeight: '700',
      margin: '0 0 4px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    notifBody: {
      fontSize: '14px',
      color: colors.textSecondary,
      lineHeight: '1.4',
      margin: '0 0 6px 0'
    },
    notifFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: colors.textSecondary
    },
    readBtn: {
      background: 'none',
      border: 'none',
      fontSize: '12px',
      fontWeight: '600',
      color: isDark ? '#60A5FA' : '#2563EB',
      cursor: 'pointer',
      padding: 0
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Top Header */}
        <div style={styles.topHeader}>
          <button type="button" onClick={onBackToDashboard} style={styles.backBtn}>
            ← Back to Dashboard
          </button>

          <div style={styles.headerActions}>
            <button type="button" onClick={handleMarkAllRead} style={styles.actionBtn}>
              ✓ Mark all as read
            </button>
            <button type="button" onClick={handleClearAll} style={styles.actionBtn}>
              🗑️ Clear all
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 6px 0' }}>
            🔔 Notifications Grid ({unreadCount} Unread)
          </h1>
          <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
            Stay updated with leave approvals, payroll announcements, and system alerts
          </p>
        </div>

        {/* Filter Pills */}
        <div style={styles.filterBar}>
          <button type="button" onClick={() => setFilter('ALL')} style={styles.filterPill(filter === 'ALL')}>
            All ({notifications.length})
          </button>
          <button type="button" onClick={() => setFilter('UNREAD')} style={styles.filterPill(filter === 'UNREAD')}>
            Unread ({unreadCount})
          </button>
          <button type="button" onClick={() => setFilter('LEAVE')} style={styles.filterPill(filter === 'LEAVE')}>
            Leave Alerts
          </button>
          <button type="button" onClick={() => setFilter('ATTENDANCE')} style={styles.filterPill(filter === 'ATTENDANCE')}>
            Attendance
          </button>
          <button type="button" onClick={() => setFilter('ANNOUNCEMENT')} style={styles.filterPill(filter === 'ANNOUNCEMENT')}>
            Announcements
          </button>
        </div>

        {/* Notifications Grid List */}
        <div style={styles.gridCard}>
          {filteredNotifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textSecondary }}>
              No notifications to display in this view.
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div key={item.id} style={styles.notifCard(item.unread)}>
                <div style={styles.iconBadge}>{getTypeIcon(item.type)}</div>

                <div style={{ flex: 1 }}>
                  <div style={styles.notifTitle}>
                    {item.title}
                    {item.unread && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#34D399' : '#15803D',
                        display: 'inline-block'
                      }} />
                    )}
                  </div>
                  <p style={styles.notifBody}>{item.message}</p>
                  <div style={styles.notifFooter}>
                    <span>{item.time}</span>
                    {item.unread && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id)}
                        style={styles.readBtn}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
