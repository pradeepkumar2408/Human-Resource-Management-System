import React, { useState, useEffect } from 'react';

// API Base URL (Configurable to gateway or host)
const API_BASE_URL = 'http://localhost:8080/api';

export default function AdminDashboard() {
  // Screen Width Listener for Responsive Layouts
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Sidebar Toggle for Mobile/Tablet Views
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hover States for Inline CSS Interactivity
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);

  // Component State
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Quick Employee Switcher State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [switcherDetails, setSwitcherDetails] = useState(null);

  // Leave Action State
  const [rejectComments, setRejectComments] = useState({});
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  // Listen to browser resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Fetch all dashboard data from backend APIs
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Employees
      const empRes = await fetch(`${API_BASE_URL}/admin/employees`);
      if (!empRes.ok) throw new Error('Failed to fetch employee database');
      const empData = await empRes.json();
      setEmployees(empData);

      // 2. Fetch Today's Attendance
      const attRes = await fetch(`${API_BASE_URL}/admin/attendance`);
      if (!attRes.ok) throw new Error('Failed to fetch attendance data');
      const attData = await attRes.json();
      setAttendance(attData);

      // 3. Fetch Leaves Queue
      const leaveRes = await fetch(`${API_BASE_URL}/admin/leaves`);
      if (!leaveRes.ok) throw new Error('Failed to fetch leave approvals queue');
      const leaveData = await leaveRes.json();
      setLeaves(leaveData);

      // 4. Fetch Analytics Reports
      const analyticsRes = await fetch(`${API_BASE_URL}/reports/analytics`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while communicating with the backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch specific employee details when switcher is toggled
  useEffect(() => {
    if (!selectedEmployeeId) {
      setSwitcherDetails(null);
      return;
    }
    const fetchEmployeeDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/employees/${selectedEmployeeId}`);
        if (res.ok) {
          const data = await res.json();
          setSwitcherDetails(data);
        }
      } catch (err) {
        console.error('Error fetching employee details:', err);
      }
    };
    fetchEmployeeDetail();
  }, [selectedEmployeeId]);

  // Quick Approve Leave Handler
  const handleApproveLeave = async (leaveId) => {
    setActioningId(leaveId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/leaves/${leaveId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Approval request failed');
      await fetchDashboardData();
    } catch (err) {
      alert(`Error approving leave: ${err.message}`);
    } finally {
      setActioningId(null);
    }
  };

  // Quick Reject Leave Handler
  const handleRejectLeave = async (leaveId) => {
    const comment = rejectComments[leaveId];
    if (!comment || comment.trim() === '') {
      alert('A rejection reason comment is mandatory.');
      return;
    }
    setActioningId(leaveId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/leaves/${leaveId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverComment: comment })
      });
      if (!res.ok) throw new Error('Rejection request failed');
      setRejectComments(prev => ({ ...prev, [leaveId]: '' }));
      setActiveRejectId(null);
      await fetchDashboardData();
    } catch (err) {
      alert(`Error rejecting leave: ${err.message}`);
    } finally {
      setActioningId(null);
    }
  };

  // Calculations for Widgets
  const pendingLeaves = leaves.filter(l => l.status === 'Pending' || l.leaveStatusName === 'Pending');
  
  // Counts based on today's attendance records
  const attendanceCounts = attendance.reduce(
    (acc, record) => {
      const status = (record.statusName || record.status || '').toLowerCase();
      if (status.includes('present')) acc.present++;
      else if (status.includes('absent')) acc.absent++;
      else if (status.includes('half')) acc.halfDay++;
      else if (status.includes('leave')) acc.onLeave++;
      return acc;
    },
    { present: 0, absent: 0, halfDay: 0, onLeave: 0 }
  );

  // Filters for Employee List Summary Widget
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(employeeSearch.toLowerCase())) ||
      (emp.employeeId && emp.employeeId.toString().includes(employeeSearch));
      
    const matchesDept = deptFilter === 'All' || emp.departmentName === deptFilter || emp.deptName === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Extract unique departments for filtering
  const departments = ['All', ...new Set(employees.map(e => e.departmentName || e.deptName).filter(Boolean))];

  // Inline CSS Styles Object (Deel-Inspired Modern Palette & Responsive Scaling)
  const styles = {
    appWrapper: {
      display: 'flex',
      backgroundColor: '#F8F9FA',
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    // Sidebar Style (Deel Navy `#0C111D`)
    sidebar: {
      width: '260px',
      backgroundColor: '#0C111D',
      color: '#F9FAFB',
      display: (isDesktop || sidebarOpen) ? 'flex' : 'none',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      zIndex: 1000,
      borderRight: '1px solid #1F2A37',
      boxShadow: isDesktop ? 'none' : '4px 0 24px rgba(0,0,0,0.15)',
      transition: 'all 0.3s ease-in-out',
    },
    sidebarLogo: {
      padding: '32px 24px 24px 24px',
      borderBottom: '1px solid #1F2A37',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logoText: {
      fontSize: '22px',
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: '-0.5px',
      margin: 0,
    },
    logoDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#2563EB',
      display: 'inline-block',
    },
    sidebarNavList: {
      listStyle: 'none',
      padding: '24px 12px',
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flexGrow: 1,
    },
    sidebarNavItem: (isActive, isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: isActive ? '#FFFFFF' : isHovered ? '#FFFFFF' : '#98A2B3',
      backgroundColor: isActive ? '#1F2A37' : isHovered ? '#1F2A37' : 'transparent',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'all 0.2s',
    }),
    sidebarFooter: {
      padding: '20px 16px',
      borderTop: '1px solid #1F2A37',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: '#070A11',
    },
    adminAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#2563EB',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '15px',
    },
    adminName: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#FFFFFF',
      margin: '0 0 2px 0',
    },
    adminRole: {
      fontSize: '11px',
      color: '#98A2B3',
      margin: 0,
    },
    // Main Content Panel
    mainPanel: {
      flex: 1,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginLeft: isDesktop ? '260px' : '0', // Keep sidebar fixed in place on desktop
    },
    // Top Navigation (Mobile / Tablet header)
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '16px 20px' : '20px 32px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E4E7EC',
      position: 'sticky',
      top: 0,
      zIndex: 900,
    },
    menuToggleBtn: {
      display: isDesktop ? 'none' : 'flex',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '22px',
      color: '#0C111D',
      cursor: 'pointer',
      padding: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    // Content Layout Container
    contentContainer: {
      padding: isMobile ? '24px 20px' : '32px 40px',
      maxWidth: '1600px',
      width: '100%',
      margin: '0 auto',
      boxSizing: 'border-box',
    },
    // Error Banner
    errorBanner: {
      backgroundColor: '#FEF3F2',
      border: '1px solid #FECDCA',
      color: '#B42318',
      padding: '16px 20px',
      borderRadius: '10px',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      lineHeight: '1.4',
    },
    // KPI Metric Grid
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: '20px',
      marginBottom: '32px',
    },
    kpiCard: (isHovered) => ({
      backgroundColor: '#FFFFFF',
      border: '1px solid #E4E7EC',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.02)',
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'all 0.2s ease-in-out',
    }),
    kpiLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#667085',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px',
    },
    kpiValue: {
      fontSize: '30px',
      fontWeight: '700',
      color: '#101828',
      margin: 0,
      letterSpacing: '-0.5px',
    },
    kpiIconBox: (bgColor, iconColor) => ({
      width: '44px',
      height: '44px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      backgroundColor: bgColor,
      color: iconColor,
    }),
    // Switcher Panel
    switcherPanel: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E4E7EC',
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '32px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    // Two Column Layout
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '8fr 4fr',
      gap: '28px',
      alignItems: 'start',
    },
    // Widget Box
    widgetCard: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E4E7EC',
      borderRadius: '12px',
      padding: isMobile ? '20px' : '28px',
      marginBottom: '28px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    widgetHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    widgetTitle: {
      fontSize: '18px',
      fontWeight: '700',
      margin: 0,
      color: '#101828',
      letterSpacing: '-0.2px',
    },
    // Table styling (Responsive wrapper needed)
    tableResponsiveWrapper: {
      width: '100%',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    },
    deelTable: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: '14px',
      minWidth: '500px', // Prevent squeeze on mobile scroll
    },
    tableHeadCell: {
      padding: '12px 16px',
      fontWeight: '600',
      color: '#475467',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      borderBottom: '1px solid #EAECF0',
    },
    tableBodyRow: {
      borderBottom: '1px solid #EAECF0',
      transition: 'background-color 0.2s',
    },
    tableBodyCell: {
      padding: '16px',
      verticalAlign: 'middle',
      color: '#344054',
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
    // Buttons
    btnPrimary: {
      backgroundColor: '#2563EB',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 18px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
      transition: 'background-color 0.2s',
    },
    btnSuccess: {
      backgroundColor: '#ECFDF3',
      color: '#027A48',
      border: '1px solid #D1FADF',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    },
    btnDanger: {
      backgroundColor: '#FEF3F2',
      color: '#B42318',
      border: '1px solid #FEE4E2',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    },
    // Filter controls
    filterRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '12px',
      marginBottom: '24px',
    },
    searchInputWrapper: {
      position: 'relative',
      flex: 1,
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#667085',
      fontSize: '15px',
    },
    searchInput: {
      width: '100%',
      padding: '10px 16px 10px 42px',
      borderRadius: '8px',
      border: '1px solid #D0D5DD',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      backgroundColor: '#FFFFFF',
    },
    switcherSelect: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #D0D5DD',
      backgroundColor: '#FFFFFF',
      fontSize: '14px',
      color: '#344054',
      fontWeight: '500',
      outline: 'none',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
    },
    // Progress Bars
    progressBarContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    progressBarWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    progressBarLabelRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '13px',
      fontWeight: '500',
      color: '#475467',
    },
    progressBarTrack: {
      height: '8px',
      backgroundColor: '#F2F4F7',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressBarFill: (width, color) => ({
      width: `${width}%`,
      height: '100%',
      backgroundColor: color,
      borderRadius: '4px',
      transition: 'width 0.5s ease',
    }),
  };

  // Close mobile sidebar on layout click
  const closeMobileSidebar = () => {
    if (!isDesktop) setSidebarOpen(false);
  };

  return (
    <div style={styles.appWrapper}>
      
      {/* 1. PERSISTENT SIDEBAR Drawer (Responsive/Collapsible) */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>D</div>
          <h2 style={styles.logoText}>Dayflow<span style={styles.logoDot}></span></h2>
        </div>
        
        <ul style={styles.sidebarNavList}>
          <li>
            <a 
              href="#dashboard" 
              style={styles.sidebarNavItem(true, false)}
            >
              <i className="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </a>
          </li>
          
          {/* Simulated navigation buttons with hover states */}
          {['Directory', 'Attendance', 'Leave Approvals', 'Payroll Control', 'Analytics Reports', 'System Settings'].map((nav, index) => {
            const icons = ['bi-people', 'bi-calendar-check', 'bi-envelope-paper', 'bi-wallet2', 'bi-graph-up-arrow', 'bi-gear'];
            const key = `nav-${index}`;
            return (
              <li key={key}>
                <a
                  href={`#${nav.toLowerCase().replace(' ', '-')}`}
                  style={styles.sidebarNavItem(false, hoveredNav === index)}
                  onMouseEnter={() => setHoveredNav(index)}
                  onMouseLeave={() => setHoveredNav(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileSidebar();
                  }}
                >
                  <i className={`bi ${icons[index]}`}></i>
                  <span>{nav}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer (Active Admin Context) */}
        <div style={styles.sidebarFooter}>
          <div style={styles.adminAvatar}>HR</div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <h4 style={styles.adminName}>Admin Portal</h4>
            <p style={styles.adminRole}>admin@dayflow.com</p>
          </div>
        </div>
      </div>

      {/* Background Overlay when Sidebar is open on Mobile */}
      {!isDesktop && sidebarOpen && (
        <div 
          onClick={closeMobileSidebar} 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(9, 30, 66, 0.4)',
            zIndex: 950,
          }}
        />
      )}

      {/* 2. MAIN PANEL */}
      <div style={styles.mainPanel}>
        
        {/* Top Navigation Bar */}
        <div style={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuToggleBtn}
              aria-label="Toggle Navigation Menu"
            >
              <i className={sidebarOpen ? 'bi bi-x-lg' : 'bi bi-list'}></i>
            </button>
            
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#101828' }}>
              Dayflow HRIS
            </h2>
          </div>

          <div style={styles.topBarRight}>
            {/* Quick Context Switcher Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!isMobile && (
                <span style={{ fontSize: '12px', color: '#667085', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Viewer Switcher:
                </span>
              )}
              <select
                style={styles.switcherSelect}
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">-- Switch to employee view --</option>
                {employees.map(emp => (
                  <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId || emp.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications Alert Bell */}
            <button 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid #D0D5DD',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#344054',
                position: 'relative'
              }}
            >
              <i className="bi bi-bell"></i>
              {pendingLeaves.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#D92D20',
                }}></span>
              )}
            </button>
          </div>
        </div>

        {/* 3. SCROLLABLE CONTENT BODY */}
        <div style={styles.contentContainer}>
          
          {/* Welcome / Meta Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#101828', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                Welcome Back, Admin
              </h1>
              <p style={{ fontSize: '14px', color: '#667085', margin: 0 }}>
                Every workday, perfectly aligned. Here is the operational summary for today.
              </p>
            </div>
            
            <button 
              onClick={fetchDashboardData}
              style={{ ...styles.btnPrimary, backgroundColor: '#FFFFFF', color: '#344054', border: '1px solid #D0D5DD', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh Data
            </button>
          </div>

          {/* Backend Connection Warning Banner */}
          {error && (
            <div style={styles.errorBanner}>
              <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '20px', color: '#D92D20' }}></i>
              <div>
                <strong style={{ display: 'block', fontWeight: '700', marginBottom: '2px' }}>
                  Microservices Connection Status (Failed to Fetch)
                </strong>
                <span>
                  The gateway API at <code>http://localhost:8080/api</code> is currently unreachable. Start the backend microservices to process live database records. Currently viewing layout.
                </span>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW CONTEXT CARD (SWITCHER PANEL) */}
          {switcherDetails && (
            <div style={styles.switcherPanel}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF8FF',
                  color: '#175CD3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '16px'
                }}>
                  {switcherDetails.firstName?.[0]}{switcherDetails.lastName?.[0]}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#101828' }}>
                    Context Snapshot: {switcherDetails.firstName} {switcherDetails.lastName}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#667085' }}>
                    {switcherDetails.designationTitle || 'Staff'} • {switcherDetails.departmentName || 'Operations'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div><strong>Phone:</strong> {switcherDetails.phone || 'N/A'}</div>
                <div><strong>Joining:</strong> {switcherDetails.joiningDate || 'N/A'}</div>
                <button 
                  style={{ ...styles.btnPrimary, backgroundColor: '#F2F4F7', color: '#344054', border: '1px solid #D0D5DD', padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setSelectedEmployeeId('')}
                >
                  Close Context
                </button>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && employees.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#667085' }}>
              <div className="spinner-border text-primary" role="status" style={{ marginBottom: '16px', width: '3rem', height: '3rem' }}></div>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Synchronizing with Spring Boot endpoints...</span>
            </div>
          ) : (
            <>
              {/* 4. KPI ROW */}
              <div style={styles.kpiGrid}>
                {/* Total Employees */}
                <div 
                  style={styles.kpiCard(hoveredCard === 0)}
                  onMouseEnter={() => setHoveredCard(0)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div>
                    <span style={styles.kpiLabel}>Total Directory</span>
                    <h3 style={styles.kpiValue}>{employees.length}</h3>
                  </div>
                  <div style={styles.kpiIconBox('#F0F9FF', '#0052CC')}>
                    <i className="bi bi-people-fill"></i>
                  </div>
                </div>

                {/* Present Today */}
                <div 
                  style={styles.kpiCard(hoveredCard === 1)}
                  onMouseEnter={() => setHoveredCard(1)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div>
                    <span style={styles.kpiLabel}>Present Today</span>
                    <h3 style={styles.kpiValue}>{attendanceCounts.present}</h3>
                  </div>
                  <div style={styles.kpiIconBox('#ECFDF3', '#027A48')}>
                    <i className="bi bi-person-check-fill"></i>
                  </div>
                </div>

                {/* Pending Leaves */}
                <div 
                  style={styles.kpiCard(hoveredCard === 2)}
                  onMouseEnter={() => setHoveredCard(2)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div>
                    <span style={styles.kpiLabel}>Pending Leaves</span>
                    <h3 style={styles.kpiValue}>{pendingLeaves.length}</h3>
                  </div>
                  <div style={styles.kpiIconBox('#FFFAE6', '#FFAB00')}>
                    <i className="bi bi-envelope-paper-fill"></i>
                  </div>
                </div>

                {/* Attendance Rate */}
                <div 
                  style={styles.kpiCard(hoveredCard === 3)}
                  onMouseEnter={() => setHoveredCard(3)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div>
                    <span style={styles.kpiLabel}>Attendance Rate</span>
                    <h3 style={styles.kpiValue}>
                      {employees.length > 0 
                        ? `${Math.round((attendanceCounts.present / employees.length) * 100)}%` 
                        : 'N/A'}
                    </h3>
                  </div>
                  <div style={styles.kpiIconBox('#F4F3FF', '#5925DC')}>
                    <i className="bi bi-percent"></i>
                  </div>
                </div>
              </div>

              {/* 5. MAIN TWO-COLUMN SPLIT GRID */}
              <div style={styles.gridContainer}>
                
                {/* LEFT COLUMN: PRIMARY QUEUES */}
                <div>
                  
                  {/* PENDING LEAVE APPROVALS QUEUE */}
                  <div style={styles.widgetCard}>
                    <div style={styles.widgetHeader}>
                      <h3 style={styles.widgetTitle}>Pending Leave Requests ({pendingLeaves.length})</h3>
                      <span style={styles.badge('#EFF8FF', '#175CD3')}>Approvals Queue</span>
                    </div>

                    {pendingLeaves.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px 16px', color: '#667085' }}>
                        <i className="bi bi-check-circle-fill" style={{ color: '#039855', fontSize: '28px', display: 'block', marginBottom: '10px' }}></i>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>No pending leave approvals queue found.</span>
                      </div>
                    ) : (
                      <div style={styles.tableResponsiveWrapper}>
                        <table style={styles.deelTable}>
                          <thead>
                            <tr style={styles.tableHeadRow}>
                              <th style={styles.tableHeadCell}>Employee</th>
                              <th style={styles.tableHeadCell}>Leave Type</th>
                              <th style={styles.tableHeadCell}>Date Range</th>
                              <th style={styles.tableHeadCell}>Remarks</th>
                              <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Action Workflow</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingLeaves.map(leave => (
                              <tr key={leave.leaveId || leave.id} style={styles.tableBodyRow}>
                                <td style={styles.tableBodyCell}>
                                  <span style={{ fontWeight: '700', color: '#101828' }}>
                                    {leave.employeeName || `${leave.firstName} ${leave.lastName}` || `ID: ${leave.employeeId}`}
                                  </span>
                                </td>
                                <td style={styles.tableBodyCell}>
                                  <span style={styles.badge('#F2F4F7', '#344054')}>
                                    {leave.leaveTypeName || leave.type || 'Time-Off'}
                                  </span>
                                </td>
                                <td style={styles.tableBodyCell}>
                                  <span style={{ fontSize: '13px', fontWeight: '500' }}>
                                    {leave.startDate} to {leave.endDate}
                                  </span>
                                </td>
                                <td style={styles.tableBodyCell}>
                                  <span style={{ fontStyle: 'italic', fontSize: '13px', color: '#667085' }}>
                                    "{leave.remarks || 'No remarks provided'}"
                                  </span>
                                </td>
                                <td style={{ ...styles.tableBodyCell, textAlign: 'right' }}>
                                  {activeRejectId === (leave.leaveId || leave.id) ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                      <input
                                        type="text"
                                        placeholder="Reason for rejection (mandatory)"
                                        style={{
                                          padding: '8px 12px',
                                          border: '1px solid #FDA29B',
                                          borderRadius: '6px',
                                          fontSize: '13px',
                                          width: '200px',
                                          outline: 'none',
                                          boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                                        }}
                                        value={rejectComments[leave.leaveId || leave.id] || ''}
                                        onChange={(e) => setRejectComments({
                                          ...rejectComments,
                                          [leave.leaveId || leave.id]: e.target.value
                                        })}
                                      />
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                          style={{ ...styles.btnDanger, padding: '5px 10px', fontSize: '12px' }}
                                          onClick={() => handleRejectLeave(leave.leaveId || leave.id)}
                                          disabled={actioningId === (leave.leaveId || leave.id)}
                                        >
                                          Confirm Rejection
                                        </button>
                                        <button
                                          style={{ ...styles.btnPrimary, backgroundColor: '#98A2B3', padding: '5px 10px', fontSize: '12px', border: 'none' }}
                                          onClick={() => setActiveRejectId(null)}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button
                                        style={styles.btnSuccess}
                                        onClick={() => handleApproveLeave(leave.leaveId || leave.id)}
                                        disabled={actioningId !== null}
                                      >
                                        <i className="bi bi-check-lg"></i> Approve
                                      </button>
                                      <button
                                        style={styles.btnDanger}
                                        onClick={() => setActiveRejectId(leave.leaveId || leave.id)}
                                        disabled={actioningId !== null}
                                      >
                                        <i className="bi bi-x-lg"></i> Reject
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* EMPLOYEE LIST SUMMARY WIDGET */}
                  <div style={styles.widgetCard}>
                    <div style={styles.widgetHeader}>
                      <h3 style={styles.widgetTitle}>Employee Database Directory</h3>
                      <span style={{ fontSize: '13px', color: '#667085', fontWeight: '500' }}>
                        Showing {filteredEmployees.length} profiles
                      </span>
                    </div>

                    {/* Filter and Search Bar */}
                    <div style={styles.filterRow}>
                      <div style={styles.searchInputWrapper}>
                        <i className="bi bi-search" style={styles.searchIcon}></i>
                        <input
                          type="text"
                          placeholder="Search directory by name, email or ID..."
                          style={styles.searchInput}
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                        />
                      </div>
                      
                      <select
                        style={styles.switcherSelect}
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                      >
                        {departments.map((dept, index) => (
                          <option key={index} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {filteredEmployees.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 16px', color: '#667085' }}>
                        <i className="bi bi-search-heart" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                        No employees found matching the current search parameters.
                      </div>
                    ) : (
                      <div style={styles.tableResponsiveWrapper}>
                        <table style={styles.deelTable}>
                          <thead>
                            <tr style={styles.tableHeadRow}>
                              <th style={styles.tableHeadCell}>Name & Profile</th>
                              <th style={styles.tableHeadCell}>Department</th>
                              <th style={styles.tableHeadCell}>Designation</th>
                              <th style={styles.tableHeadCell}>Account Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEmployees.map(emp => (
                              <tr key={emp.employeeId || emp.id} style={styles.tableBodyRow}>
                                <td style={styles.tableBodyCell}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                      width: '38px',
                                      height: '38px',
                                      borderRadius: '50%',
                                      backgroundColor: '#F2F4F7',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: '700',
                                      color: '#475467',
                                      fontSize: '13px'
                                    }}>
                                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                                    </div>
                                    <div>
                                      <span style={{ fontWeight: '700', display: 'block', color: '#101828' }}>
                                        {emp.firstName} {emp.lastName}
                                      </span>
                                      <span style={{ fontSize: '12px', color: '#667085' }}>
                                        ID: {emp.employeeId || emp.id} • {emp.email}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td style={styles.tableBodyCell}>{emp.departmentName || emp.deptName || 'N/A'}</td>
                                <td style={styles.tableBodyCell}>{emp.designationTitle || emp.title || 'N/A'}</td>
                                <td style={styles.tableBodyCell}>
                                  <span style={styles.badge(
                                    emp.isActive === 'Y' || emp.active ? '#ECFDF3' : '#FEF3F2',
                                    emp.isActive === 'Y' || emp.active ? '#027A48' : '#B42318'
                                  )}>
                                    {emp.isActive === 'Y' || emp.active ? 'Active' : 'Suspended'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT COLUMN: SIDE METRICS & TREND CHARTS */}
                <div>
                  
                  {/* TODAY'S ATTENDANCE BREAKDOWN */}
                  <div style={styles.widgetCard}>
                    <div style={styles.widgetHeader}>
                      <h3 style={styles.widgetTitle}>Attendance Breakdown</h3>
                      <i className="bi bi-clock" style={{ fontSize: '18px', color: '#667085' }}></i>
                    </div>
                    
                    <div style={styles.progressBarContainer}>
                      {/* Present */}
                      <div style={styles.progressBarWrapper}>
                        <div style={styles.progressBarLabelRow}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#027A48' }}></span>Present</span>
                          <strong>
                            {attendanceCounts.present} ({employees.length > 0 ? Math.round((attendanceCounts.present / employees.length) * 100) : 0}%)
                          </strong>
                        </div>
                        <div style={styles.progressBarTrack}>
                          <div style={styles.progressBarFill(
                            employees.length > 0 ? (attendanceCounts.present / employees.length) * 100 : 0, 
                            '#027A48'
                          )}></div>
                        </div>
                      </div>

                      {/* Half-day */}
                      <div style={styles.progressBarWrapper}>
                        <div style={styles.progressBarLabelRow}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFAB00' }}></span>Half-Day</span>
                          <strong>
                            {attendanceCounts.halfDay} ({employees.length > 0 ? Math.round((attendanceCounts.halfDay / employees.length) * 100) : 0}%)
                          </strong>
                        </div>
                        <div style={styles.progressBarTrack}>
                          <div style={styles.progressBarFill(
                            employees.length > 0 ? (attendanceCounts.halfDay / employees.length) * 100 : 0, 
                            '#FFAB00'
                          )}></div>
                        </div>
                      </div>

                      {/* On Leave */}
                      <div style={styles.progressBarWrapper}>
                        <div style={styles.progressBarLabelRow}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#175CD3' }}></span>Approved Leave</span>
                          <strong>
                            {attendanceCounts.onLeave} ({employees.length > 0 ? Math.round((attendanceCounts.onLeave / employees.length) * 100) : 0}%)
                          </strong>
                        </div>
                        <div style={styles.progressBarTrack}>
                          <div style={styles.progressBarFill(
                            employees.length > 0 ? (attendanceCounts.onLeave / employees.length) * 100 : 0, 
                            '#175CD3'
                          )}></div>
                        </div>
                      </div>

                      {/* Absent */}
                      <div style={styles.progressBarWrapper}>
                        <div style={styles.progressBarLabelRow}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#B42318' }}></span>Absent</span>
                          <strong>
                            {attendanceCounts.absent} ({employees.length > 0 ? Math.round((attendanceCounts.absent / employees.length) * 100) : 0}%)
                          </strong>
                        </div>
                        <div style={styles.progressBarTrack}>
                          <div style={styles.progressBarFill(
                            employees.length > 0 ? (attendanceCounts.absent / employees.length) * 100 : 0, 
                            '#B42318'
                          )}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ANALYTICS TREND GRAPHS */}
                  <div style={styles.widgetCard}>
                    <div style={styles.widgetHeader}>
                      <h3 style={styles.widgetTitle}>Historical Trends</h3>
                      <i className="bi bi-bar-chart-line" style={{ fontSize: '18px', color: '#667085' }}></i>
                    </div>

                    {/* SVG Line Chart */}
                    <div style={{ marginBottom: '24px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#475467', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>
                        Weekly Attendance Rate
                      </span>
                      
                      <div style={{ border: '1px solid #EAECF0', borderRadius: '8px', padding: '16px 12px', backgroundColor: '#FCFCFD' }}>
                        <svg viewBox="0 0 300 100" style={{ width: '100%', height: '90px' }}>
                          {/* Grid Lines */}
                          <line x1="0" y1="20" x2="300" y2="20" stroke="#F2F4F7" strokeWidth="1" />
                          <line x1="0" y1="50" x2="300" y2="50" stroke="#F2F4F7" strokeWidth="1" />
                          <line x1="0" y1="80" x2="300" y2="80" stroke="#F2F4F7" strokeWidth="1" />
                          
                          {/* Trend Line Gradient */}
                          <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2"/>
                              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0"/>
                            </linearGradient>
                          </defs>

                          {/* Gradient Fill under Line */}
                          <path
                            d="M 10 30 L 58 20 L 106 45 L 154 23 L 202 15 L 250 80 L 290 70 L 290 80 L 10 80 Z"
                            fill="url(#lineGrad)"
                          />

                          {/* Trend Line (Data Points: Mon 92%, Tue 95%, Wed 88%, Thu 94%, Fri 96%, Sat 75%, Sun 80%) */}
                          <path
                            d="M 10 30 L 58 20 L 106 45 L 154 23 L 202 15 L 250 80 L 290 70"
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* Trend Points */}
                          <circle cx="10" cy="30" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                          <circle cx="58" cy="20" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                          <circle cx="106" cy="45" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                          <circle cx="154" cy="23" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                          <circle cx="202" cy="15" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                          <circle cx="250" cy="80" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                          <circle cx="290" cy="70" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />

                          {/* Day Labels */}
                          <text x="10" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">M</text>
                          <text x="58" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">T</text>
                          <text x="106" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">W</text>
                          <text x="154" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">T</text>
                          <text x="202" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">F</text>
                          <text x="250" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">S</text>
                          <text x="290" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">S</text>
                        </svg>
                      </div>
                    </div>

                    {/* SVG Bar Chart */}
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#475467', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>
                        Monthly Leave Volumes
                      </span>
                      
                      <div style={{ border: '1px solid #EAECF0', borderRadius: '8px', padding: '16px 12px', backgroundColor: '#FCFCFD' }}>
                        <svg viewBox="0 0 300 100" style={{ width: '100%', height: '90px' }}>
                          {/* Bars for May, Jun, Jul, Aug */}
                          {/* May */}
                          <rect x="40" y="45" width="24" height="40" rx="4" fill="#0052CC" opacity="0.8" />
                          {/* Jun */}
                          <rect x="100" y="25" width="24" height="60" rx="4" fill="#2563EB" />
                          {/* Jul */}
                          <rect x="160" y="60" width="24" height="25" rx="4" fill="#0052CC" opacity="0.8" />
                          {/* Aug */}
                          <rect x="220" y="15" width="24" height="70" rx="4" fill="#2563EB" />

                          {/* Base line */}
                          <line x1="10" y1="85" x2="290" y2="85" stroke="#EAECF0" strokeWidth="1" />

                          {/* Month Labels */}
                          <text x="52" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">May</text>
                          <text x="112" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">Jun</text>
                          <text x="172" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">Jul</text>
                          <text x="232" y="96" fontSize="9" fontWeight="600" fill="#98A2B3" textAnchor="middle">Aug</text>
                        </svg>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
