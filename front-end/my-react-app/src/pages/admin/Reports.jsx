import React, { useState } from 'react';

export default function Reports({ employees, leaves, darkMode, colors }) {
  const [reportType, setReportType] = useState('attendance'); // attendance, salary, leaves
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');

  // Export Toast state
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(''); // PDF, Excel

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
      flexWrap: 'wrap',
      gap: '16px',
    },
    controlRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      marginBottom: '32px',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: darkMode ? '#111827' : '#F9FAFB',
      border: `1px solid ${colors.border}`,
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
      minWidth: '200px',
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
      transition: 'all 0.3s ease',
    },
    btnExport: (format) => ({
      backgroundColor: format === 'Excel' ? (darkMode ? '#0F3C24' : '#ECFDF3') : (darkMode ? '#1E293B' : '#F2F4F7'),
      color: format === 'Excel' ? (darkMode ? '#86EFAC' : '#027A48') : colors.text,
      border: `1px solid ${format === 'Excel' ? (darkMode ? '#135832' : '#D1FADF') : colors.border}`,
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s',
    }),
    chartGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '24px',
    },
    chartContainer: {
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: colors.chartBg,
      transition: 'all 0.3s ease',
    },
    chartTitle: {
      fontSize: '15px',
      fontWeight: '700',
      marginBottom: '16px',
      color: colors.text,
    }
  };

  const triggerExport = (format) => {
    setExportFormat(format);
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`Report compiled successfully. Exported ${reportType.toUpperCase()} summary as ${format} format.`);
    }, 1500);
  };

  // SVG Chart Calculations: Department Headcounts
  const deptCounts = employees.reduce((acc, emp) => {
    const dept = emp.departmentName || emp.deptName || 'Operations';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const deptData = Object.entries(deptCounts);
  const maxCount = Math.max(...deptData.map(([_, count]) => count), 1);

  // SVG Chart Calculations: Leave types distributions
  const leaveCounts = leaves.reduce((acc, l) => {
    const type = l.leaveTypeName || l.type || 'Casual';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const leaveData = Object.entries(leaveCounts);
  const maxLeaveCount = Math.max(...leaveData.map(([_, count]) => count), 1);

  return (
    <div style={styles.card}>
      {/* Header Row */}
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.title}>Audits & Reports Generator</h3>
          <span style={{ fontSize: '13px', color: colors.textMuted }}>
            Generate analytical document summaries and visualizations
          </span>
        </div>
      </div>

      {/* Configuration Controls */}
      <div style={styles.controlRow}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>Report Type</label>
          <select
            style={styles.select}
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="attendance">Attendance Ledger Report</option>
            <option value="salary">Salary Registers Slip Roll</option>
            <option value="leaves">Leave Summary Utilization</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>Start Date</label>
          <input
            type="date"
            style={styles.dateInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>End Date</label>
          <input
            type="date"
            style={styles.dateInput}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignSelf: 'flex-end', marginTop: isMobile ? '12px' : '0' }}>
          <button 
            style={styles.btnExport('Excel')}
            onClick={() => triggerExport('Excel')}
            disabled={exporting}
          >
            {exporting && exportFormat === 'Excel' ? (
              <>
                <i className="bi bi-hourglass-split"></i> Compiling...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-spreadsheet-fill"></i> Export Excel
              </>
            )}
          </button>
          <button 
            style={styles.btnExport('PDF')}
            onClick={() => triggerExport('PDF')}
            disabled={exporting}
          >
            {exporting && exportFormat === 'PDF' ? (
              <>
                <i className="bi bi-hourglass-split"></i> Compiling...
              </>
            ) : (
              <>
                <i className="bi bi-file-pdf-fill"></i> Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chart Visualizations Section */}
      <h4 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, marginBottom: '20px' }}>
        Analytical Headcount & Leave Graphs
      </h4>

      <div style={styles.chartGrid}>
        
        {/* Chart 1: Department Distribution Bar Chart */}
        <div style={styles.chartContainer}>
          <h5 style={styles.chartTitle}>Department Headcount Metrics</h5>
          {deptData.length === 0 ? (
            <div style={{ color: colors.textMuted, textAlign: 'center', padding: '40px 0' }}>No directory data loaded.</div>
          ) : (
            <svg viewBox="0 0 300 150" style={{ width: '100%', height: '140px' }}>
              <line x1="30" y1="120" x2="290" y2="120" stroke={darkMode ? '#374151' : '#EAECF0'} />
              {deptData.map(([dept, count], idx) => {
                const x = 50 + idx * 60;
                const barHeight = (count / maxCount) * 80;
                const y = 120 - barHeight;
                return (
                  <g key={idx}>
                    <rect x={x - 12} y={y} width="24" height={barHeight} rx="3" fill="#2563EB" />
                    <text x={x} y={y - 6} fontSize="8" fontWeight="700" fill={colors.text} textAnchor="middle">{count}</text>
                    <text x={x} y="132" fontSize="7" fontWeight="600" fill={colors.textMuted} textAnchor="middle">{dept.slice(0, 10)}</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Chart 2: Leave Type Distributions Bar Chart */}
        <div style={styles.chartContainer}>
          <h5 style={styles.chartTitle}>Leave Type Distributions</h5>
          {leaveData.length === 0 ? (
            <div style={{ color: colors.textMuted, textAlign: 'center', padding: '40px 0' }}>No leave applications logged.</div>
          ) : (
            <svg viewBox="0 0 300 150" style={{ width: '100%', height: '140px' }}>
              <line x1="30" y1="120" x2="290" y2="120" stroke={darkMode ? '#374151' : '#EAECF0'} />
              {leaveData.map(([type, count], idx) => {
                const x = 50 + idx * 60;
                const barHeight = (count / maxLeaveCount) * 80;
                const y = 120 - barHeight;
                return (
                  <g key={idx}>
                    <rect x={x - 12} y={y} width="24" height={barHeight} rx="3" fill="#0052CC" opacity="0.8" />
                    <text x={x} y={y - 6} fontSize="8" fontWeight="700" fill={colors.text} textAnchor="middle">{count}</text>
                    <text x={x} y="132" fontSize="7" fontWeight="600" fill={colors.textMuted} textAnchor="middle">{type.slice(0, 10)}</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

      </div>
    </div>
  );
}
