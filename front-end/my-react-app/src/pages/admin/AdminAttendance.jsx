import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8111/api';

export default function AdminAttendance({ attendance, setAttendance, employees, darkMode, colors }) {
  // Filters state
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Present, Absent, Late
  
  // Drilldown Individual Selector state
  const [drilldownEmpId, setDrilldownEmpId] = useState('');

  // Correct Status Modal state
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [correctionData, setCorrectionData] = useState({
    status: 'Present',
    checkInTime: '09:00 AM',
    checkOutTime: '05:00 PM',
    auditRemark: ''
  });

  // Export Toast state
  const [exporting, setExporting] = useState(false);

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
    dateInput: {
      padding: '9px 14px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.cardBg,
      color: colors.text,
      fontSize: '14px',
      outline: 'none',
      minWidth: '150px',
      transition: 'all 0.3s ease',
    },
    deelTable: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: '14px',
      minWidth: '700px',
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
      if (s.includes('present')) { bg = '#ECFDF3'; text = '#027A48'; }
      else if (s.includes('absent')) { bg = '#FEF3F2'; text = '#B42318'; }
      else if (s.includes('late')) { bg = '#FFF9E6'; text = '#B76E00'; }
      else if (s.includes('half')) { bg = '#FFF1E6'; text = '#C43E00'; }
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
  };

  // Base list depending on whether drilldown is selected
  const baseAttendance = drilldownEmpId
    ? attendance.filter(att => att.employeeId === drilldownEmpId)
    : attendance;

  // Filter Logic
  const filteredAttendance = baseAttendance.filter(att => {
    // 1. Filter by Date (Only if not drilling down individual history)
    const matchesDate = drilldownEmpId || att.date === dateFilter;
    
    // 2. Filter by Department
    // We lookup the departmentName from the employees array using employeeId
    const emp = employees.find(e => (e.employeeId || e.id) === att.employeeId);
    const matchesDept = 
      deptFilter === 'All' || 
      (emp && (emp.departmentName === deptFilter || emp.deptName === deptFilter));
    
    // 3. Filter by Status
    const matchesStatus = 
      statusFilter === 'All' || 
      att.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesDate && matchesDept && matchesStatus;
  });

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert('Attendance Excel Sheet generated successfully! Downloading document...');
    }, 1500);
  };

  // Correction Action
  const triggerCorrection = (rec) => {
    setActiveRecord(rec);
    setCorrectionData({
      status: rec.status,
      checkInTime: rec.checkInTime || rec.checkIn || '09:00 AM',
      checkOutTime: rec.checkOutTime || rec.checkOut || '05:00 PM',
      auditRemark: rec.remarks || ''
    });
    setIsCorrecting(true);
  };

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    if (!correctionData.auditRemark.trim()) {
      alert('An audit remark explanation is mandatory to correct attendance records.');
      return;
    }

    const parseTimeToDateTimeString = (dateStr, timeStr) => {
      if (!timeStr) return null;
      if (timeStr.includes('T')) return timeStr;
      
      let hours = 9;
      let minutes = 0;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
      }
      
      const paddedHours = String(hours).padStart(2, '0');
      const paddedMinutes = String(minutes).padStart(2, '0');
      return `${dateStr}T${paddedHours}:${paddedMinutes}:00`;
    };

    const workDate = activeRecord.workDate || activeRecord.date || new Date().toISOString().split('T')[0];
    const recId = activeRecord.attendanceId || activeRecord.id;

    const payload = {
      checkIn: correctionData.status === 'Absent' ? null : parseTimeToDateTimeString(workDate, correctionData.checkInTime),
      checkOut: (correctionData.status === 'Absent' || !correctionData.checkOutTime) ? null : parseTimeToDateTimeString(workDate, correctionData.checkOutTime),
      auditRemark: correctionData.auditRemark.trim(),
      statusCode: correctionData.status.toUpperCase()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/admin/attendance/${recId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setAttendance(prev => prev.map(rec => {
          if (rec.id === recId || (rec.attendanceId && rec.attendanceId === recId)) {
            // Keep local compatibility
            return {
              ...rec,
              ...saved,
              status: saved.statusCode.charAt(0) + saved.statusCode.slice(1).toLowerCase(),
              remarks: `Admin Corrected: "${correctionData.auditRemark}"`
            };
          }
          return rec;
        }));
        setIsCorrecting(false);
        setActiveRecord(null);
        alert('Attendance corrected successfully in database.');
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.message || 'Failed to update attendance correction.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  return (
    <div style={styles.card}>
      
      {/* Header Info */}
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.title}>Daily Attendance Registry</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: colors.textMuted }}>
            {drilldownEmpId ? 'Viewing historical login records for selected staff.' : `Showing status reports for date: ${dateFilter}`}
          </p>
        </div>
        
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '24px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: exporting ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            opacity: exporting ? 0.7 : 1,
            transition: 'all 0.3s'
          }}
        >
          {exporting ? (
            <>
              <i className="bi bi-hourglass-split"></i> Exporting...
            </>
          ) : (
            <>
              <i className="bi bi-download"></i> Export Report
            </>
          )}
        </button>
      </div>

      {/* Filters Row */}
      <div style={styles.filterRow}>
        {/* Date Filter (Hidden during individual drilldown) */}
        {!drilldownEmpId && (
          <input
            type="date"
            style={styles.dateInput}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        )}

        {/* Individual Selector Drilldown */}
        <select
          style={styles.select}
          value={drilldownEmpId}
          onChange={(e) => setDrilldownEmpId(e.target.value)}
        >
          <option value="">-- All Employees --</option>
          {employees.map(emp => (
            <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>

        {/* Department Filter */}
        <select
          style={styles.select}
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="All">All Departments</option>
          {employees.reduce((acc, emp) => {
            const d = emp.departmentName || emp.deptName;
            if (d && !acc.includes(d)) acc.push(d);
            return acc;
          }, []).map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          style={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="Half-Day">Half-Day</option>
        </select>
      </div>

      {/* Attendance Registry Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={styles.deelTable}>
          <thead>
            <tr>
              <th style={styles.tableHeadCell}>Employee Name</th>
              <th style={styles.tableHeadCell}>Date</th>
              <th style={styles.tableHeadCell}>Check In</th>
              <th style={styles.tableHeadCell}>Check Out</th>
              <th style={styles.tableHeadCell}>Status</th>
              <th style={styles.tableHeadCell}>Audits & Remarks</th>
              <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ ...styles.tableBodyCell, textAlign: 'center', padding: '40px', color: colors.textMuted }}>
                  No attendance records found matching filters.
                </td>
              </tr>
            ) : (
              filteredAttendance.map(record => {
                const emp = employees.find(e => (e.employeeId || e.id) === record.employeeId);
                return (
                  <tr key={record.id || record.attendanceId} style={styles.tableBodyRow}>
                    <td style={styles.tableBodyCell}>
                      <strong>{record.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${record.employeeId}`)}</strong>
                      <div style={{ fontSize: '11px', color: colors.textMuted }}>
                        {emp ? emp.departmentName : 'Operations'}
                      </div>
                    </td>
                    <td style={styles.tableBodyCell}>{record.date}</td>
                    <td style={styles.tableBodyCell}>{record.checkInTime || record.checkIn || '--'}</td>
                    <td style={styles.tableBodyCell}>{record.checkOutTime || record.checkOut || '--'}</td>
                    <td style={styles.tableBodyCell}>
                      <span style={styles.badge(record.status)}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ ...styles.tableBodyCell, fontStyle: 'italic', fontSize: '13px', color: colors.textMuted }}>
                      {record.remarks || 'None'}
                    </td>
                    <td style={{ ...styles.tableBodyCell, textAlign: 'right' }}>
                      <button
                        style={styles.btnAction}
                        onClick={() => triggerCorrection(record)}
                      >
                        <i className="bi bi-gear-fill"></i> Override
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CORRECT ATTENDANCE MODAL */}
      {isCorrecting && activeRecord && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: colors.text }}>Correct Attendance Record</h4>
              <button 
                onClick={() => setIsCorrecting(false)}
                style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textMuted }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>
                  Staff: <strong>{activeRecord.employeeName}</strong>
                </span>
                <span style={{ fontSize: '13px', color: colors.textMuted }}>
                  Date: <strong>{activeRecord.date}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Status</label>
                <select
                  style={styles.select}
                  value={correctionData.status}
                  onChange={(e) => setCorrectionData({ ...correctionData, status: e.target.value })}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              {correctionData.status !== 'Absent' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Check In Time</label>
                    <input
                      type="text"
                      style={styles.dateInput}
                      value={correctionData.checkInTime}
                      onChange={(e) => setCorrectionData({ ...correctionData, checkInTime: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Check Out Time</label>
                    <input
                      type="text"
                      style={styles.dateInput}
                      value={correctionData.checkOutTime}
                      onChange={(e) => setCorrectionData({ ...correctionData, checkOutTime: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>Audit Remark / Reason *</label>
                <textarea
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.cardBg,
                    color: colors.text,
                    fontSize: '14px',
                    outline: 'none',
                    minHeight: '80px',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Explain why this manual status adjustment is required..."
                  value={correctionData.auditRemark}
                  onChange={(e) => setCorrectionData({ ...correctionData, auditRemark: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
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
                  onClick={() => setIsCorrecting(false)}
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
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
