import React, { useState } from 'react';

export default function Notifications({ notifications, setNotifications, darkMode, colors }) {
  // Broadcaster State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Announcement'); // Announcement, Policy, Urgent

  const isMobile = window.innerWidth < 768;

  const styles = {
    card: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: isMobile ? '20px' : '28px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease',
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      color: colors.text,
      margin: 0,
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
    },
    splitGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '5fr 7fr',
      gap: '28px',
      alignItems: 'start',
    },
    widgetCard: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease',
    },
    widgetTitle: {
      fontSize: '16px',
      fontWeight: '700',
      marginBottom: '18px',
      color: colors.text,
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      marginBottom: '16px',
    },
    label: {
      fontSize: '11px',
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.cardBg,
      color: colors.text,
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    select: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.cardBg,
      color: colors.text,
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    textarea: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.cardBg,
      color: colors.text,
      fontSize: '14px',
      outline: 'none',
      minHeight: '100px',
      resize: 'none',
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
    },
    btnSubmit: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '24px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      alignSelf: 'flex-end',
    },
    badge: (cat) => {
      const c = (cat || '').toLowerCase();
      let bg = '#ECFDF3';
      let text = '#027A48';
      if (c === 'urgent') { bg = '#FEF3F2'; text = '#B42318'; }
      else if (c === 'policy') { bg = '#EFF8FF'; text = '#175CD3'; }
      return {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '700',
        backgroundColor: bg,
        color: text,
      };
    }
  };

  const handleComposeSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Announcement Title and Message Content are required fields.');
      return;
    }

    const newAlert = {
      id: `ALERT_${Date.now()}`,
      title: title.trim(),
      message: content.trim(),
      type: category,
      timestamp: 'Just Now',
      isBroadcast: true
    };

    setNotifications(prev => [newAlert, ...prev]);
    setTitle('');
    setContent('');
    alert('Broadcast Bulletin successfully compiled and published to Notice Board!');
  };

  const handleDeleteAlert = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div style={styles.card}>
      {/* Header Row */}
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.title}>System Announcements & Alerts</h3>
          <span style={{ fontSize: '13px', color: colors.textMuted }}>
            Publish announcements and review HR system alert triggers
          </span>
        </div>
      </div>

      <div style={styles.splitGrid}>
        
        {/* Left Side: Broadcast announcement writer */}
        <div style={styles.widgetCard}>
          <h4 style={styles.widgetTitle}>Compose Announcement</h4>
          <form onSubmit={handleComposeSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Broadcast Channel Category</label>
              <select
                style={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Announcement">General Announcement</option>
                <option value="Policy">Policy Update</option>
                <option value="Urgent">Urgent Bulletin</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. Independence Day Holiday Announcement"
                style={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Message Content</label>
              <textarea
                placeholder="Compose the bulletin message details here..."
                style={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <button type="submit" style={styles.btnSubmit}>
              <i className="bi bi-send-fill"></i> Publish Bulletin
            </button>
          </form>
        </div>

        {/* Right Side: Alerts log */}
        <div style={styles.widgetCard}>
          <h4 style={styles.widgetTitle}>Active Alerts Log ({notifications.length})</h4>
          
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textMuted }}>
              <i className="bi bi-bell-slash" style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}></i>
              <span>No notifications or announcements posted.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {notifications.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: darkMode ? '#111827' : '#FCFCFD',
                    position: 'relative',
                    transition: 'all 0.3s'
                  }}
                >
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                    title="Dismiss Alert"
                  >
                    <i className="bi bi-trash"></i>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={styles.badge(alert.type || 'Announcement')}>
                      {(alert.type || 'Announcement').toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', color: colors.textMuted }}>{alert.timestamp}</span>
                  </div>

                  <strong style={{ display: 'block', fontSize: '14px', color: colors.text, marginBottom: '6px' }}>
                    {alert.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted, lineHeight: '1.4' }}>
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
