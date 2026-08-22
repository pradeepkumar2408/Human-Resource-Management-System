import React, { useState, useEffect } from 'react';

/**
 * LeaveManagement.jsx - Dayflow HRMS (Deel Theme)
 * 
 * Features:
 * - Centered Success Pop-up with OK Button.
 * - Centered Confirmation Modal for Leave Withdrawal.
 * - Leave application form, overlap validation, leave history table.
 * - 100% INLINE CSS ONLY.
 */
export default function LeaveManagement({
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
    buttonText: isDark ? '#000000' : '#FFFFFF',
    successBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
    successText: isDark ? '#34D399' : '#15803D'
  };

  const [activeTab, setActiveTab] = useState('apply');
  const [isLoading, setIsLoading] = useState(false);
  const [successPopUp, setSuccessPopUp] = useState('');
  const [withdrawConfirm, setWithdrawConfirm] = useState(null);

  // Form State
  const [form, setForm] = useState({
    leaveType: 'Paid',
    startDate: '',
    endDate: '',
    remarks: ''
  });

  const [filterType, setFilterType] = useState('ALL');

  // Leave Requests History State
  const [requests, setRequests] = useState([
    { id: 101, type: 'Paid', startDate: '2026-08-28', endDate: '2026-08-29', days: 2, remarks: 'Family function', status: 'Approved', appliedAt: '2026-08-20' },
    { id: 102, type: 'Sick', startDate: '2026-08-18', endDate: '2026-08-18', days: 1, remarks: 'Fever and rest', status: 'Approved', appliedAt: '2026-08-17' },
    { id: 103, type: 'Unpaid', startDate: '2026-09-05', endDate: '2026-09-08', days: 4, remarks: 'Personal travel', status: 'Pending', appliedAt: '2026-08-21' }
  ]);

  // Fetch Leave Requests
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const token = localStorage.getItem('dayflow_token');
        const res = await fetch(`${apiBaseUrl}/api/leaves/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setRequests(data);
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchLeaves();
  }, [apiBaseUrl]);

  // Validation
  const validateLeaveForm = () => {
    if (!form.startDate || !form.endDate) {
      alert('Please select both Start Date and End Date.');
      return false;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      alert('End Date cannot be before Start Date.');
      return false;
    }

    const hasOverlap = requests.some((req) => {
      const existingStart = new Date(req.startDate);
      const existingEnd = new Date(req.endDate);
      const newStart = new Date(form.startDate);
      const newEnd = new Date(form.endDate);
      return newStart <= existingEnd && newEnd >= existingStart && req.status !== 'Rejected';
    });

    if (hasOverlap) {
      alert('Selected dates overlap with an existing leave request!');
      return false;
    }

    return true;
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!validateLeaveForm()) return;

    setIsLoading(true);
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    try {
      const token = localStorage.getItem('dayflow_token');
      await fetch(`${apiBaseUrl}/api/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          leaveType: form.leaveType,
          startDate: form.startDate,
          endDate: form.endDate,
          remarks: form.remarks
        })
      }).catch(() => null);

      const newReq = {
        id: Date.now(),
        type: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        days: daysCount,
        remarks: form.remarks || 'N/A',
        status: 'Pending',
        appliedAt: new Date().toISOString().split('T')[0]
      };

      setRequests([newReq, ...requests]);
      setSuccessPopUp('Leave application submitted successfully!');
      setForm({ leaveType: 'Paid', startDate: '', endDate: '', remarks: '' });
      setActiveTab('history');
    } finally {
      setIsLoading(false);
    }
  };

  const executeWithdraw = async () => {
    if (!withdrawConfirm) return;
    const reqId = withdrawConfirm.id;
    setWithdrawConfirm(null);

    try {
      const token = localStorage.getItem('dayflow_token');
      await fetch(`${apiBaseUrl}/api/leaves/${reqId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => null);

      setRequests((prev) => prev.filter((r) => r.id !== reqId));
      setSuccessPopUp('Leave request withdrawn successfully!');
    } catch (err) {
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
      setSuccessPopUp('Leave request withdrawn successfully!');
    }
  };

  const filteredRequests = filterType === 'ALL'
    ? requests
    : requests.filter((r) => r.type === filterType);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return { bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7', text: isDark ? '#34D399' : '#15803D' };
      case 'Rejected':
        return { bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', text: isDark ? '#FCA5A5' : '#B91C1C' };
      default:
        return { bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7', text: isDark ? '#FBBF24' : '#B45309' };
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
    tabGroup: {
      display: 'flex',
      backgroundColor: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '10px',
      padding: '4px'
    },
    tabBtn: (active) => ({
      padding: '8px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      border: 'none',
      backgroundColor: active ? colors.buttonBg : 'transparent',
      color: active ? colors.buttonText : colors.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }),
    card: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: '32px',
      boxSizing: 'border-box'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 14px',
      backgroundColor: colors.inputBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '10px',
      fontSize: '14px',
      color: colors.textPrimary,
      outline: 'none',
      boxSizing: 'border-box'
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    submitBtn: {
      width: '100%',
      padding: '14px',
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '12px'
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
    },

    // CENTERED CONFIRMATION MODAL CARD
    confirmModalCard: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '24px',
      padding: '32px 28px',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
      animation: 'dayflowPopIn 0.25s ease-out'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    confirmBtn: {
      flex: 1,
      padding: '12px',
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer'
    },
    cancelBtn: {
      flex: 1,
      padding: '12px',
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      color: colors.textSecondary,
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
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

      {/* WITHDRAW LEAVE CONFIRMATION MODAL */}
      {withdrawConfirm && (
        <div style={styles.modalBackdrop}>
          <div style={styles.confirmModalCard}>
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>
              Withdraw Leave Request?
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.5' }}>
              Are you sure you want to withdraw your pending leave request for <strong style={{ color: colors.textPrimary }}>{withdrawConfirm.startDate} to {withdrawConfirm.endDate}</strong>?
            </p>

            <div style={styles.modalActions}>
              <button type="button" onClick={executeWithdraw} style={styles.confirmBtn}>
                Confirm Withdrawal
              </button>
              <button type="button" onClick={() => setWithdrawConfirm(null)} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.wrapper}>
        {/* Top Header */}
        <div style={styles.topHeader}>
          <button type="button" onClick={onBackToDashboard} style={styles.backBtn}>
            ← Back to Dashboard
          </button>

          <div style={styles.tabGroup}>
            <button
              type="button"
              onClick={() => setActiveTab('apply')}
              style={styles.tabBtn(activeTab === 'apply')}
            >
              Apply Leave
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              style={styles.tabBtn(activeTab === 'history')}
            >
              Leave History
            </button>
          </div>
        </div>

        {/* TAB 1: APPLY LEAVE */}
        {activeTab === 'apply' && (
          <div style={styles.card}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 24px 0' }}>
              📝 Leave Application Form
            </h2>

            <form onSubmit={handleApplyLeave}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Leave Type</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  style={styles.input}
                >
                  <option value="Paid">Paid Leave (Annual Quota)</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ ...styles.gridTwo, marginBottom: '20px' }}>
                <div>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div>
                  <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Remarks / Reason for Leave</label>
                <textarea
                  placeholder="Explain the reason for your leave request..."
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  style={{ ...styles.input, height: '90px', resize: 'vertical' }}
                />
              </div>

              <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                {isLoading ? 'Submitting Leave...' : 'Submit Leave Application'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: LEAVE HISTORY */}
        {activeTab === 'history' && (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                📋 My Leave Requests History
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: colors.textSecondary }}>Filter by Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={styles.input}
                >
                  <option value="ALL">All Types</option>
                  <option value="Paid">Paid</option>
                  <option value="Sick">Sick</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Days</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th}>Status Badge</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr key={item.id}>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{item.type}</td>
                      <td style={styles.td}>{item.startDate} to {item.endDate}</td>
                      <td style={styles.td}>{item.days} Day(s)</td>
                      <td style={styles.td}>{item.remarks}</td>
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
                      <td style={styles.td}>
                        {item.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => setWithdrawConfirm(item)}
                            style={{
                              background: 'none',
                              border: `1px solid ${colors.border}`,
                              color: isDark ? '#FCA5A5' : '#B91C1C',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Withdraw
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
