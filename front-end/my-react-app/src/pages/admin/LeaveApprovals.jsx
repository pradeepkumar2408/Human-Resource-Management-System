import React, { useState } from 'react';

export default function LeaveApprovals({ leaves, setLeaves, employees, darkMode, colors }) {
  // Filters state
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Pending, Approved, Rejected
  
  // Rejection Comment states
  const [rejectComments, setRejectComments] = useState({});
  const [activeRejectId, setActiveRejectId] = useState(null);

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
    },
    filterRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '24px',
      alignItems: 'center',
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
      minWidth: '150px',
      transition: 'all 0.3s ease',
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
    badge: (status) => {
      const s = (status || '').toLowerCase();
      let bg = '#F2F4F7';
      let text = '#344054';
      if (s === 'approved') { bg = '#ECFDF3'; text = '#027A48'; }
      else if (s === 'rejected') { bg = '#FEF3F2'; text = '#B42318'; }
      else if (s === 'pending') { bg = '#FFFAE6'; text = '#B76E00'; }
      return {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: bg,
        color: text,
      };
    },
    btnSuccess: {
      backgroundColor: darkMode ? '#0F3C24' : '#ECFDF3',
      color: darkMode ? '#86EFAC' : '#027A48',
      border: `1px solid ${darkMode ? '#135832' : '#D1FADF'}`,
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s',
    },
    btnDanger: {
      backgroundColor: darkMode ? '#4C1D1D' : '#FEF3F2',
      color: darkMode ? '#FCA5A5' : '#B42318',
      border: `1px solid ${darkMode ? '#7F1D1D' : '#FEE4E2'}`,
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s',
    },
  };

  // Filter lists configuration
  const leaveTypes = ['All', ...new Set(leaves.map(l => l.leaveTypeName || l.type).filter(Boolean))];

  // Filtering Logic
  const filteredLeaves = leaves.filter(leave => {
    const matchesEmp = 
      employeeFilter === 'All' || 
      leave.employeeId === employeeFilter;

    const matchesType = 
      typeFilter === 'All' || 
      (leave.leaveTypeName || leave.type) === typeFilter;

    const status = (leave.status || leave.leaveStatusName || '').toLowerCase();
    const matchesStatus = 
      statusFilter === 'All' || 
      status === statusFilter.toLowerCase();

    return matchesEmp && matchesType && matchesStatus;
  });

  // Action: Approve
  const handleApprove = (leaveId) => {
    setLeaves(prev => prev.map(leave => {
      const id = leave.leaveId || leave.id;
      if (id === leaveId) {
        return {
          ...leave,
          status: 'Approved',
          leaveStatusName: 'Approved',
          remarks: leave.remarks ? `${leave.remarks} (Approved by Admin)` : 'Approved by Admin'
        };
      }
      return leave;
    }));
  };

  // Action: Reject
  const handleReject = (leaveId) => {
    const comment = rejectComments[leaveId];
    if (!comment || !comment.trim()) {
      alert('A rejection reason comment is mandatory.');
      return;
    }

    setLeaves(prev => prev.map(leave => {
      const id = leave.leaveId || leave.id;
      if (id === leaveId) {
        return {
          ...leave,
          status: 'Rejected',
          leaveStatusName: 'Rejected',
          remarks: `Rejected by Admin: "${comment}"`
        };
      }
      return leave;
    }));

    // Reset local reject state
    setRejectComments(prev => ({ ...prev, [leaveId]: '' }));
    setActiveRejectId(null);
  };

  return (
    <div style={styles.card}>
      {/* Header Info */}
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.title}>Leave Approvals Pipeline</h3>
          <span style={{ fontSize: '13px', color: colors.textMuted }}>
            Auditing and verifying employee leave logs ({filteredLeaves.length} entries)
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div style={styles.filterRow}>
        <select
          style={styles.select}
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
        >
          <option value="All">All Employees</option>
          {employees.map(emp => (
            <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {leaveTypes.map((type, idx) => (
            <option key={idx} value={type}>{type === 'All' ? 'All Leave Types' : type}</option>
          ))}
        </select>

        <select
          style={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending Approvals</option>
          <option value="Approved">Approved Log</option>
          <option value="Rejected">Rejected Log</option>
        </select>
      </div>

      {/* Approvals Grid */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={styles.deelTable}>
          <thead>
            <tr>
              <th style={styles.tableHeadCell}>Employee</th>
              <th style={styles.tableHeadCell}>Leave Type</th>
              <th style={styles.tableHeadCell}>Date Range</th>
              <th style={styles.tableHeadCell}>Days</th>
              <th style={styles.tableHeadCell}>Reason / remarks</th>
              <th style={styles.tableHeadCell}>Status</th>
              <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Workflow</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ ...styles.tableBodyCell, textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                  No leave requests found matching filters.
                </td>
              </tr>
            ) : (
              filteredLeaves.map(leave => {
                const leaveId = leave.leaveId || leave.id;
                const status = (leave.status || leave.leaveStatusName || 'Pending').toLowerCase();
                const emp = employees.find(e => (e.employeeId || e.id) === leave.employeeId);
                return (
                  <tr key={leaveId} style={styles.tableBodyRow}>
                    <td style={styles.tableBodyCell}>
                      <strong>{leave.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${leave.employeeId}`)}</strong>
                    </td>
                    <td style={styles.tableBodyCell}>
                      <span style={styles.badge(status === 'pending' ? 'pending' : status === 'approved' ? 'approved' : 'rejected')}>
                        {leave.leaveTypeName || leave.type}
                      </span>
                    </td>
                    <td style={styles.tableBodyCell}>{leave.startDate} to {leave.endDate}</td>
                    <td style={styles.tableBodyCell}>{leave.numberOfDays || 1} days</td>
                    <td style={{ ...styles.tableBodyCell, fontStyle: 'italic', fontSize: '13px', color: colors.textMuted }}>
                      "{leave.remarks || 'No remarks provided'}"
                    </td>
                    <td style={styles.tableBodyCell}>
                      <span style={styles.badge(status)}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ ...styles.tableBodyCell, textAlign: 'right' }}>
                      {status === 'pending' ? (
                        activeRejectId === leaveId ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <input
                              type="text"
                              placeholder="Comment is mandatory..."
                              style={{
                                padding: '8px 12px',
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                fontSize: '13px',
                                width: '200px',
                                backgroundColor: colors.cardBg,
                                color: colors.text,
                                outline: 'none'
                              }}
                              value={rejectComments[leaveId] || ''}
                              onChange={(e) => setRejectComments({ ...rejectComments, [leaveId]: e.target.value })}
                            />
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button style={{ ...styles.btnDanger, padding: '5px 10px' }} onClick={() => handleReject(leaveId)}>Reject</button>
                              <button 
                                style={{
                                  backgroundColor: '#98A2B3',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                                onClick={() => setActiveRejectId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button style={styles.btnSuccess} onClick={() => handleApprove(leaveId)}>
                              <i className="bi bi-check-lg"></i> Approve
                            </button>
                            <button style={styles.btnDanger} onClick={() => setActiveRejectId(leaveId)}>
                              <i className="bi bi-x-lg"></i> Reject
                            </button>
                          </div>
                        )
                      ) : (
                        <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
