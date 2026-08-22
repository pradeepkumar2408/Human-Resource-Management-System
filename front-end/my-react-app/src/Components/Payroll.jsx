import React, { useState, useEffect } from 'react';

/**
 * Payroll.jsx - Dayflow HRMS (Deel Theme)
 * 
 * Features:
 * - Centered Success Pop-up with OK Button.
 * - Centered Confirmation Modal for Salary Slip Download.
 * - Read-only Salary Breakdown & monthly payment history.
 * - 100% INLINE CSS ONLY.
 */
export default function Payroll({
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

  const [successPopUp, setSuccessPopUp] = useState('');
  const [downloadConfirm, setDownloadConfirm] = useState(null);

  const [salary, setSalary] = useState({
    basic: 6500,
    hra: 2200,
    allowances: 1300,
    deductions: 800,
    netPay: 9200
  });

  const [history, setHistory] = useState([
    { id: 1, month: 'July 2026', payDate: '2026-07-31', basic: 6500, hra: 2200, allowances: 1300, deductions: 800, netPay: 9200, status: 'Paid' },
    { id: 2, month: 'June 2026', payDate: '2026-06-30', basic: 6500, hra: 2200, allowances: 1300, deductions: 800, netPay: 9200, status: 'Paid' },
    { id: 3, month: 'May 2026', payDate: '2026-05-31', basic: 6500, hra: 2200, allowances: 1300, deductions: 800, netPay: 9200, status: 'Paid' }
  ]);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const token = localStorage.getItem('dayflow_token');
        const res = await fetch(`${apiBaseUrl}/api/payroll/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) setSalary(data);
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchPayroll();
  }, [apiBaseUrl]);

  const executeDownloadSlip = () => {
    if (!downloadConfirm) return;
    const month = downloadConfirm.month;
    setDownloadConfirm(null);
    setSuccessPopUp(`Salary slip PDF for ${month} downloaded successfully!`);
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
    card: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: '28px',
      marginBottom: '28px',
      boxSizing: 'border-box'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '700',
      margin: '0 0 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    salaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '16px'
    },
    salaryBox: {
      backgroundColor: colors.badgeBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '14px',
      padding: '16px',
      textAlign: 'center'
    },
    boxLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      marginBottom: '6px'
    },
    boxVal: {
      fontSize: '18px',
      fontWeight: '800',
      color: colors.textPrimary
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
    downloadBtn: {
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      border: 'none',
      padding: '6px 14px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '700',
      cursor: 'pointer'
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
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
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

      {/* CENTERED CONFIRMATION MODAL */}
      {downloadConfirm && (
        <div style={styles.modalBackdrop}>
          <div style={styles.confirmModalCard}>
            <div style={{ fontSize: '38px', marginBottom: '12px' }}>📄</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>
              Confirm Salary Slip Download
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: '1.5' }}>
              Are you sure you want to download the salary slip PDF for <strong style={{ color: colors.textPrimary }}>{downloadConfirm.month}</strong>?
            </p>

            <div style={styles.modalActions}>
              <button type="button" onClick={executeDownloadSlip} style={styles.confirmBtn}>
                Confirm Download
              </button>
              <button type="button" onClick={() => setDownloadConfirm(null)} style={styles.cancelBtn}>
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
        </div>

        {/* Read-Only Salary Breakdown */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>💵 Salary Breakdown & Compensation</h2>
          <div style={styles.salaryGrid}>
            <div style={styles.salaryBox}>
              <div style={styles.boxLabel}>Basic Salary</div>
              <div style={styles.boxVal}>${salary.basic.toLocaleString()}</div>
            </div>
            <div style={styles.salaryBox}>
              <div style={styles.boxLabel}>HRA</div>
              <div style={styles.boxVal}>${salary.hra.toLocaleString()}</div>
            </div>
            <div style={styles.salaryBox}>
              <div style={styles.boxLabel}>Allowances</div>
              <div style={styles.boxVal}>${salary.allowances.toLocaleString()}</div>
            </div>
            <div style={styles.salaryBox}>
              <div style={styles.boxLabel}>Deductions</div>
              <div style={{ ...styles.boxVal, color: isDark ? '#FCA5A5' : '#B91C1C' }}>
                -${salary.deductions.toLocaleString()}
              </div>
            </div>
            <div style={{ ...styles.salaryBox, backgroundColor: colors.buttonBg, color: colors.buttonText }}>
              <div style={{ ...styles.boxLabel, color: colors.buttonText }}>Monthly Net Pay</div>
              <div style={{ ...styles.boxVal, color: colors.buttonText }}>
                ${salary.netPay.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Table */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📑 Monthly Payment History & Salary Slips</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Pay Period</th>
                <th style={styles.th}>Payment Date</th>
                <th style={styles.th}>Net Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Salary Slip PDF</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td style={{ ...styles.td, fontWeight: '700' }}>{item.month}</td>
                  <td style={styles.td}>{item.payDate}</td>
                  <td style={{ ...styles.td, fontWeight: '700', color: isDark ? '#34D399' : '#15803D' }}>
                    ${item.netPay.toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
                      color: isDark ? '#34D399' : '#15803D'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      type="button"
                      onClick={() => setDownloadConfirm(item)}
                      style={styles.downloadBtn}
                    >
                      📥 Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
