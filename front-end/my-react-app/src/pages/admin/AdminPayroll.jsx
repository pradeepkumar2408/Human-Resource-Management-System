import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8111/api';

export default function AdminPayroll({ employees, setEmployees, darkMode, colors }) {
  // Active editing payroll states
  const [editingEmp, setEditingEmp] = useState(null);
  const [salaryStructure, setSalaryStructure] = useState({
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0
  });

  // Bulk Generator State
  const [runningPayroll, setRunningPayroll] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    deelTable: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: '14px',
      minWidth: '800px',
    },
    tableHeadCell: {
      padding: '12px 16px',
      fontWeight: '600',
      color: colors.textMuted,
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      borderBottom: `1px solid ${colors.tableBorder}`,
    },
    tableBodyRow: {
      borderBottom: `1px solid ${colors.tableBorder}`,
      transition: 'background-color 0.2s',
    },
    tableBodyCell: {
      padding: '16px',
      verticalAlign: 'middle',
      color: colors.text,
    },
    badge: (bgColor, textColor) => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: bgColor,
      color: textColor,
    }),
    btnAction: {
      padding: '6px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`,
      color: colors.text,
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '28px',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 20px 24px -4px rgba(16, 24, 40, 0.08)',
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
    alertFlag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '700',
      backgroundColor: '#FEF3F2',
      color: '#B42318',
      border: '1px solid #FEE4E2'
    }
  };

  // Run Bulk Payroll Generator
  const handleRunPayroll = async () => {
    setRunningPayroll(true);
    const currentPeriod = new Date().toISOString().substring(0, 7); // e.g. "2026-08"
    try {
      const res = await fetch(`${API_BASE_URL}/admin/payroll/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payPeriod: currentPeriod })
      });

      if (res.ok) {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.message || 'Failed to generate payroll batch.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setRunningPayroll(false);
    }
  };

  // Edit structure dialog trigger
  const triggerEditStructure = (emp) => {
    setEditingEmp(emp);
    const sal = emp.salary || { basic: 0, hra: 0, allowances: 0, deductions: 0 };
    setSalaryStructure({
      basic: sal.basicSalary || sal.basic || 0,
      hra: sal.hra || 0,
      allowances: sal.allowances || 0,
      deductions: sal.deductions || 0
    });
  };

  // Save structure changes to database
  const handleSaveStructure = async (e) => {
    e.preventDefault();
    const empId = editingEmp.employeeId || editingEmp.id;
    const payload = {
      basicSalary: Number(salaryStructure.basic),
      hra: Number(salaryStructure.hra),
      allowances: Number(salaryStructure.allowances),
      deductions: Number(salaryStructure.deductions)
    };

    try {
      const res = await fetch(`${API_BASE_URL}/admin/payroll/salary-structure/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedStructure = await res.json();
        setEmployees(prev => prev.map(emp => {
          if ((emp.employeeId || emp.id) === empId) {
            return {
              ...emp,
              salary: savedStructure
            };
          }
          return emp;
        }));
        setEditingEmp(null);
        alert('Salary structure updated successfully in database.');
      } else {
        alert('Failed to update salary structure in database.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  return (
    <div style={styles.card}>
      {/* Success Toast */}
      {showSuccessToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#ECFDF3',
          border: '1px solid #D1FADF',
          color: '#027A48',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600'
        }}>
          <i className="bi bi-check-circle-fill"></i>
          <span>Salary Slips compiled and sent to all active employees!</span>
        </div>
      )}

      {/* Header Info */}
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.title}>Payroll Operations & Structuring</h3>
          <span style={{ fontSize: '13px', color: colors.textMuted }}>
            Current Cycle: **August 2026** • Showing salary structures & accuracy flags
          </span>
        </div>

        <button
          onClick={handleRunPayroll}
          disabled={runningPayroll}
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '24px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: runningPayroll ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            opacity: runningPayroll ? 0.7 : 1,
            transition: 'all 0.3s'
          }}
        >
          {runningPayroll ? (
            <>
              <i className="bi bi-hourglass-split"></i> Running Cycle...
            </>
          ) : (
            <>
              <i className="bi bi-file-earmark-check-fill"></i> Bulk Generate Payslips
            </>
          )}
        </button>
      </div>

      {/* Payroll Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={styles.deelTable}>
          <thead>
            <tr>
              <th style={styles.tableHeadCell}>Staff Member</th>
              <th style={styles.tableHeadCell}>Basic Pay</th>
              <th style={styles.tableHeadCell}>HRA</th>
              <th style={styles.tableHeadCell}>Allowances</th>
              <th style={styles.tableHeadCell}>Deductions</th>
              <th style={styles.tableHeadCell}>Net Take-Home</th>
              <th style={styles.tableHeadCell}>Accuracy Auditing</th>
              <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ ...styles.tableBodyCell, textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                  No directory profiles available to run payroll.
                </td>
              </tr>
            ) : (
              employees.map(emp => {
                const sal = emp.salary || { basic: 0, hra: 0, allowances: 0, deductions: 0 };
                const netPay = (sal.basic || 0) + (sal.hra || 0) + (sal.allowances || 0) - (sal.deductions || 0);
                
                // Audit checks
                const isMissingStructure = !sal.basic || sal.basic <= 0;
                const isNegativeNetPay = netPay < 0;

                return (
                  <tr key={emp.employeeId || emp.id} style={styles.tableBodyRow}>
                    <td style={styles.tableBodyCell}>
                      <strong>{emp.firstName} {emp.lastName}</strong>
                      <div style={{ fontSize: '12px', color: colors.textMuted }}>{emp.designationTitle}</div>
                    </td>
                    <td style={styles.tableBodyCell}>₹{(sal.basic || 0).toLocaleString()}</td>
                    <td style={styles.tableBodyCell}>₹{(sal.hra || 0).toLocaleString()}</td>
                    <td style={styles.tableBodyCell}>₹{(sal.allowances || 0).toLocaleString()}</td>
                    <td style={styles.tableBodyCell}>₹{(sal.deductions || 0).toLocaleString()}</td>
                    <td style={{ ...styles.tableBodyCell, fontWeight: '700', color: isNegativeNetPay ? '#B42318' : colors.text }}>
                      ₹{netPay.toLocaleString()}
                    </td>
                    <td style={styles.tableBodyCell}>
                      {isMissingStructure ? (
                        <span style={styles.alertFlag}>
                          <i className="bi bi-exclamation-triangle-fill"></i> Missing Structure
                        </span>
                      ) : isNegativeNetPay ? (
                        <span style={styles.alertFlag}>
                          <i className="bi bi-exclamation-triangle-fill"></i> Negative Net Pay
                        </span>
                      ) : (
                        <span style={styles.badge(darkMode ? '#0F3C24' : '#ECFDF3', darkMode ? '#86EFAC' : '#027A48')}>
                          <i className="bi bi-check-lg" style={{ marginRight: '4px' }}></i> Structure Verified
                        </span>
                      )}
                    </td>
                    <td style={{ ...styles.tableBodyCell, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          style={styles.btnAction}
                          onClick={() => triggerEditStructure(emp)}
                        >
                          <i className="bi bi-sliders"></i> Edit Structure
                        </button>
                        <button
                          style={{ ...styles.btnAction, color: '#2563EB' }}
                          onClick={() => alert(`Generating PDF slip for ${emp.firstName} ${emp.lastName}...`)}
                        >
                          <i className="bi bi-file-earmark-pdf"></i> Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT SALARY STRUCTURE MODAL */}
      {editingEmp && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: colors.text }}>Edit Salary Structure</h4>
              <button 
                onClick={() => setEditingEmp(null)}
                style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textMuted }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleSaveStructure} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '8px' }}>
                Employee: <strong>{editingEmp.firstName} {editingEmp.lastName}</strong>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Basic Pay (₹)</label>
                <input
                  type="number"
                  required
                  style={styles.input}
                  value={salaryStructure.basic}
                  onChange={(e) => setSalaryStructure({ ...salaryStructure, basic: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>House Rent Allowance (HRA) (₹)</label>
                <input
                  type="number"
                  required
                  style={styles.input}
                  value={salaryStructure.hra}
                  onChange={(e) => setSalaryStructure({ ...salaryStructure, hra: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Special Allowances (₹)</label>
                <input
                  type="number"
                  required
                  style={styles.input}
                  value={salaryStructure.allowances}
                  onChange={(e) => setSalaryStructure({ ...salaryStructure, allowances: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>PF & Tax Deductions (₹)</label>
                <input
                  type="number"
                  required
                  style={styles.input}
                  value={salaryStructure.deductions}
                  onChange={(e) => setSalaryStructure({ ...salaryStructure, deductions: e.target.value })}
                />
              </div>

              {/* Live Preview of Net Take-Home */}
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: darkMode ? '#111827' : '#F9FAFB',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: '700',
                fontSize: '14px',
                color: colors.text,
                marginBottom: '16px'
              }}>
                <span>Live Take-Home Estimate:</span>
                <span>₹{(Number(salaryStructure.basic) + Number(salaryStructure.hra) + Number(salaryStructure.allowances) - Number(salaryStructure.deductions)).toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  onClick={() => setEditingEmp(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Save Salary Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
