import React, { useState, useEffect } from 'react';
import EmployeeList from './EmployeeList';
import AdminAttendance from './AdminAttendance';
import LeaveApprovals from './LeaveApprovals';
import AdminPayroll from './AdminPayroll';
import Reports from './Reports';
import Notifications from './Notifications';

// API Base URL (Configurable to gateway or host)
const API_BASE_URL = 'http://localhost:8111/api';

export default function AdminDashboard() {
  // Screen Width Listener for Responsive Layouts
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Navbar Toggle for Mobile/Tablet Views
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Tab State (Dashboard, Directory, Attendance, Leaves, Payroll, Reports, Notifications)
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Dark Mode state
  const [darkMode, setDarkMode] = useState(false);

  // Hover States for CSS Interactivity
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [hoveredThemeBtn, setHoveredThemeBtn] = useState(false);

  // Component State
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quick Employee Switcher State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [switcherDetails, setSwitcherDetails] = useState(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');

  // Close searchable switcher when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#custom-switcher')) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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

      // 4. Fetch Broadcast Alerts
      const alertsRes = await fetch(`${API_BASE_URL}/admin/notifications`);
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setNotifications(alertsData);
      }
    } catch (err) {
      console.error('Offline mode loaded. Error: ', err.message);
      setError(err.message || 'An error occurred while communicating with the backend services.');
      
      // Initialize High-Fidelity Mock Data fallback for offline demo
      setEmployees([
        { id: 'EMP001', employeeId: 'EMP001', firstName: 'John', lastName: 'Doe', email: 'john.doe@dayflow.com', phone: '+91 98765 43210', departmentName: 'Engineering', designationTitle: 'Software Engineer', joiningDate: '2024-03-15', managerName: 'Sarah Jenkins', role: 'Employee', active: true, salary: { basic: 55000, hra: 22000, allowances: 11000, deductions: 5500 }, documents: { aadhar: 'Verified', pan: 'Verified', offerLetter: 'Uploaded' } },
        { id: 'EMP002', employeeId: 'EMP002', firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.j@dayflow.com', phone: '+91 98765 43211', departmentName: 'Engineering', designationTitle: 'Engineering Manager', joiningDate: '2022-01-10', managerName: 'David Vance', role: 'HR', active: true, salary: { basic: 95000, hra: 38000, allowances: 19000, deductions: 9500 }, documents: { aadhar: 'Verified', pan: 'Verified', offerLetter: 'Uploaded' } },
        { id: 'EMP003', employeeId: 'EMP003', firstName: 'Alex', lastName: 'Rivera', email: 'alex.r@dayflow.com', phone: '+91 98765 43212', departmentName: 'Marketing', designationTitle: 'SEO Specialist', joiningDate: '2024-05-20', managerName: 'Sarah Jenkins', role: 'Employee', active: true, salary: { basic: 45000, hra: 18000, allowances: 9000, deductions: 4500 }, documents: { aadhar: 'Pending', pan: 'Verified', offerLetter: 'Pending' } },
        { id: 'EMP004', employeeId: 'EMP004', firstName: 'Emma', lastName: 'Stone', email: 'emma.s@dayflow.com', phone: '+91 98765 43213', departmentName: 'Operations', designationTitle: 'Operations Lead', joiningDate: '2023-11-01', managerName: 'David Vance', role: 'Employee', active: false, salary: { basic: 65000, hra: 26000, allowances: 13000, deductions: 6500 }, documents: { aadhar: 'Verified', pan: 'Pending', offerLetter: 'Uploaded' } },
        { id: 'EMP005', employeeId: 'EMP005', firstName: 'David', lastName: 'Vance', email: 'david.v@dayflow.com', phone: '+91 98765 43214', departmentName: 'Operations', designationTitle: 'VP Operations', joiningDate: '2020-08-01', managerName: 'None', role: 'HR', active: true, salary: { basic: 130000, hra: 52000, allowances: 26000, deductions: 13000 }, documents: { aadhar: 'Verified', pan: 'Verified', offerLetter: 'Uploaded' } },
      ]);

      setAttendance([
        { id: 'ATT001', employeeId: 'EMP001', employeeName: 'John Doe', date: '2026-08-22', checkInTime: '09:05 AM', checkOutTime: '05:30 PM', status: 'Present', remarks: 'Checked in on time' },
        { id: 'ATT002', employeeId: 'EMP002', employeeName: 'Sarah Jenkins', date: '2026-08-22', checkInTime: '08:55 AM', checkOutTime: '06:00 PM', status: 'Present', remarks: '' },
        { id: 'ATT003', employeeId: 'EMP003', employeeName: 'Alex Rivera', date: '2026-08-22', checkInTime: '09:30 AM', checkOutTime: '05:45 PM', status: 'Late', remarks: 'Metro delay' },
        { id: 'ATT004', employeeId: 'EMP004', employeeName: 'Emma Stone', date: '2026-08-22', checkInTime: '--', checkOutTime: '--', status: 'Absent', remarks: 'Sick leave logged' },
        { id: 'ATT005', employeeId: 'EMP005', employeeName: 'David Vance', date: '2026-08-22', checkInTime: '09:00 AM', checkOutTime: '05:00 PM', status: 'Present', remarks: '' }
      ]);

      setLeaves([
        { id: 'LV001', employeeId: 'EMP001', employeeName: 'John Doe', leaveTypeName: 'Privilege Leave', startDate: '2026-08-25', endDate: '2026-08-28', numberOfDays: 4, remarks: 'Family function in hometown', status: 'Pending' },
        { id: 'LV002', employeeId: 'EMP003', employeeName: 'Alex Rivera', leaveTypeName: 'Sick Leave', startDate: '2026-08-23', endDate: '2026-08-24', numberOfDays: 2, remarks: 'Recovering from viral fever', status: 'Pending' },
        { id: 'LV003', employeeId: 'EMP004', employeeName: 'Emma Stone', leaveTypeName: 'Casual Leave', startDate: '2026-08-22', endDate: '2026-08-22', numberOfDays: 1, remarks: 'Personal work', status: 'Approved' }
      ]);

      setNotifications([
        { id: 'N001', title: 'New Leave Request Filed', message: 'John Doe has requested 4 days of Privilege Leave starting Aug 25.', type: 'Announcement', timestamp: '5 mins ago' },
        { id: 'N002', title: 'Aadhar Document Uploaded', message: 'Emma Stone uploaded Aadhar card proof for verification.', type: 'Policy', timestamp: '1 hour ago' },
        { id: 'N003', title: 'Gateway Connection Alert', message: 'Vite portal is running in offline demo mode. Enable Spring Boot services for live DB synchronization.', type: 'Urgent', timestamp: 'Just Now' }
      ]);
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
    // Fallback context builder if backend fails
    const emp = employees.find(e => (e.employeeId || e.id) === selectedEmployeeId);
    if (emp) {
      setSwitcherDetails(emp);
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
  }, [selectedEmployeeId, employees]);

  // Quick Approve Leave Handler (Dashboard Specific widget action)
  const handleApproveLeave = async (leaveId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/leaves/${leaveId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: 'Approved from Dashboard Quick Action' })
      });
      if (res.ok) {
        setLeaves(prev => prev.map(leave => {
          if ((leave.leaveId || leave.id) === leaveId) {
            return { ...leave, status: 'Approved', leaveStatusName: 'Approved' };
          }
          return leave;
        }));
        alert('Leave approved successfully.');
      } else {
        alert('Failed to approve leave request.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

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

  const pendingLeaves = leaves.filter(l => (l.status === 'Pending' || l.leaveStatusName === 'Pending'));

  // Theme Colors Mapping (Dynamic depending on darkMode state)
  const colors = {
    bg: darkMode ? '#0B0F19' : '#F8F9FA', 
    navBg: darkMode ? '#111827' : '#FFFFFF', 
    cardBg: darkMode ? '#1F2937' : '#FFFFFF', 
    border: darkMode ? '#374151' : '#E4E7EC', 
    text: darkMode ? '#F9FAFB' : '#101828', 
    textMuted: darkMode ? '#9CA3AF' : '#667085', 
    accent: darkMode ? '#60A5FA' : '#2563EB',
    tableHeaderBg: darkMode ? '#1F2937' : '#FFFFFF',
    tableBorder: darkMode ? '#374151' : '#EAECF0',
    btnSignOutBg: darkMode ? '#F9FAFB' : '#000000',
    btnSignOutText: darkMode ? '#111827' : '#FFFFFF',
    kpiIconBg: darkMode ? '#374151' : '#F0F9FF',
    kpiIconColor: darkMode ? '#D1D5DB' : '#0052CC',
    chartBg: darkMode ? '#111827' : '#FCFCFD',
    inputBg: darkMode ? '#1F2937' : '#FFFFFF',
  };

  // Safe DOM Reset Style Application inside useEffect (Supports React 19 and bypasses rendering issues)
  useEffect(() => {
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.width = '100%';
      rootEl.style.maxWidth = '100%';
      rootEl.style.margin = '0';
      rootEl.style.padding = '0';
      rootEl.style.textAlign = 'left';
      rootEl.style.borderInline = 'none';
      rootEl.style.backgroundColor = colors.bg;
      rootEl.style.transition = 'background-color 0.3s ease';
    }
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100%';
    document.body.style.maxWidth = '100%';
    document.body.style.backgroundColor = colors.bg;
    document.body.style.transition = 'background-color 0.3s ease';
    
    const htmlEl = document.documentElement;
    if (htmlEl) {
      htmlEl.style.margin = '0';
      htmlEl.style.padding = '0';
      htmlEl.style.width = '100%';
      htmlEl.style.backgroundColor = colors.bg;
      htmlEl.style.transition = 'background-color 0.3s ease';
    }
  }, [darkMode, colors.bg]);

  // Inline CSS Styles Object (Deel-Inspired Modern Palette, Transitions & Responsive)
  const styles = {
    appWrapper: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.bg,
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background-color 0.3s ease, color 0.3s ease',
      color: colors.text,
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '16px 20px' : '20px 48px',
      backgroundColor: colors.navBg,
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 900,
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    },
    topBarLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    logoText: {
      fontSize: '24px',
      fontWeight: '800',
      color: colors.text,
      letterSpacing: '-0.8px',
      margin: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'color 0.3s ease',
    },
    logoDot: {
      color: '#2563EB',
    },
    navLinksContainer: {
      display: (isDesktop || isTablet) ? 'flex' : 'none',
      alignItems: 'center',
      gap: '20px',
      marginLeft: '12px',
    },
    navLink: (isActive, isHovered) => ({
      fontSize: '14px',
      fontWeight: '600',
      color: isActive ? colors.accent : isHovered ? colors.accent : colors.text,
      textDecoration: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '20px',
      backgroundColor: isActive 
        ? (darkMode ? 'rgba(96, 165, 250, 0.12)' : 'rgba(37, 99, 235, 0.08)') 
        : isHovered 
          ? (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)') 
          : 'transparent',
      transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    dropdownArrow: {
      fontSize: '10px',
      opacity: 0.8,
      marginLeft: '2px',
      fontWeight: 'bold',
      transition: 'transform 0.2s ease',
    },
    topBarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    switcherSelect: {
      padding: '8px 12px',
      borderRadius: '20px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.inputBg,
      fontSize: '13px',
      color: colors.text,
      fontWeight: '600',
      outline: 'none',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
      maxWidth: isMobile ? '100px' : '170px',
      transition: 'all 0.3s ease',
    },
    bellButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.inputBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
      color: colors.text,
      position: 'relative',
      transition: 'all 0.3s ease',
    },
    bellBadge: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#D92D20',
    },
    themeButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.inputBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
      color: darkMode ? '#FFD700' : '#475467',
      transform: hoveredThemeBtn ? 'rotate(30deg) scale(1.05)' : 'rotate(0) scale(1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    profileAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#0C111D',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '14px',
      cursor: 'pointer',
      border: `2px solid ${colors.border}`,
      transition: 'border-color 0.3s ease',
    },
    btnSignOut: (isHovered) => ({
      backgroundColor: isHovered ? '#B42318' : colors.btnSignOutBg,
      color: isHovered ? '#FFFFFF' : colors.btnSignOutText,
      border: 'none',
      borderRadius: '24px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      display: isMobile ? 'none' : 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    }),
    mobileMenuBtn: {
      display: (isDesktop || isTablet) ? 'none' : 'flex',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '22px',
      color: colors.text,
      cursor: 'pointer',
      padding: 0,
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.3s ease',
    },
    mobileDrawer: {
      display: (!isDesktop && !isTablet && mobileMenuOpen) ? 'flex' : 'none',
      flexDirection: 'column',
      backgroundColor: colors.navBg,
      borderBottom: `1px solid ${colors.border}`,
      padding: '16px 20px 24px 20px',
      position: 'absolute',
      top: '73px',
      left: 0,
      width: '100%',
      zIndex: 850,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      gap: '16px',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    },
    contentContainer: {
      padding: isMobile ? '24px 20px' : '40px 48px',
      maxWidth: '1400px',
      width: '100%',
      margin: '0 auto',
      boxSizing: 'border-box',
    },
    errorBanner: {
      backgroundColor: darkMode ? '#2D1616' : '#FEF3F2',
      border: `1px solid ${darkMode ? '#7A1C1C' : '#FECDCA'}`,
      color: darkMode ? '#FCA5A5' : '#B42318',
      padding: '16px 20px',
      borderRadius: '10px',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      lineHeight: '1.4',
      transition: 'all 0.3s ease',
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: '20px',
      marginBottom: '32px',
    },
    kpiCard: (isHovered) => ({
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      boxShadow: isHovered ? '0 12px 28px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
      transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    kpiLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px',
      transition: 'color 0.3s ease',
    },
    kpiValue: {
      fontSize: '30px',
      fontWeight: '700',
      color: colors.text,
      margin: 0,
      letterSpacing: '-0.5px',
      transition: 'color 0.3s ease',
    },
    kpiIconBox: (bgColor, textColor) => ({
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      backgroundColor: bgColor,
      color: textColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      transition: 'all 0.3s ease',
    }),
    switcherPanel: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '20px 24px',
      marginBottom: '32px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '8fr 4fr',
      gap: '28px',
      alignItems: 'start',
    },
    widgetCard: {
      backgroundColor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: isMobile ? '20px' : '28px',
      marginBottom: '28px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease, border-color 0.3s ease',
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
      color: colors.text,
      letterSpacing: '-0.2px',
      transition: 'color 0.3s ease',
    },
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
      minWidth: '500px',
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
      color: colors.text,
    },
    progressBarTrack: {
      height: '8px',
      backgroundColor: darkMode ? '#374151' : '#F2F4F7',
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

  return (
    <div style={styles.appWrapper}>
      {/* 1. DEEL STYLE TOP NAVBAR */}
      <div style={styles.topBar}>
        
        {/* Left Side: Brand Logo & Navigation Tabs */}
        <div style={styles.topBarLeft}>
          <h2 style={styles.logoText} onClick={() => setActiveTab('Dashboard')}>
            dayflow<span style={styles.logoDot}>.</span>
          </h2>

          <nav style={styles.navLinksContainer}>
            <a 
              href="#dashboard" 
              style={styles.navLink(activeTab === 'Dashboard', hoveredNav === 'Dashboard')}
              onMouseEnter={() => setHoveredNav('Dashboard')}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={(e) => { e.preventDefault(); setActiveTab('Dashboard'); }}
            >
              Dashboard
            </a>

            <a 
              href="#directory" 
              style={styles.navLink(activeTab === 'Directory', hoveredNav === 'Directory')}
              onMouseEnter={() => setHoveredNav('Directory')}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={(e) => { e.preventDefault(); setActiveTab('Directory'); }}
            >
              Directory <i className="bi bi-chevron-down" style={styles.dropdownArrow}></i>
            </a>

            <a 
              href="#attendance" 
              style={styles.navLink(activeTab === 'Attendance', hoveredNav === 'Attendance')}
              onMouseEnter={() => setHoveredNav('Attendance')}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={(e) => { e.preventDefault(); setActiveTab('Attendance'); }}
            >
              Attendance <i className="bi bi-chevron-down" style={styles.dropdownArrow}></i>
            </a>

            <a 
              href="#leaves" 
              style={styles.navLink(activeTab === 'Leaves', hoveredNav === 'Leaves')}
              onMouseEnter={() => setHoveredNav('Leaves')}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={(e) => { e.preventDefault(); setActiveTab('Leaves'); }}
            >
              Leave Approvals <i className="bi bi-chevron-down" style={styles.dropdownArrow}></i>
            </a>

            <a 
              href="#payroll" 
              style={styles.navLink(activeTab === 'Payroll', hoveredNav === 'Payroll')}
              onMouseEnter={() => setHoveredNav('Payroll')}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={(e) => { e.preventDefault(); setActiveTab('Payroll'); }}
            >
              Payroll
            </a>

            <a 
              href="#reports" 
              style={styles.navLink(activeTab === 'Reports', hoveredNav === 'Reports')}
              onMouseEnter={() => setHoveredNav('Reports')}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={(e) => { e.preventDefault(); setActiveTab('Reports'); }}
            >
              Analytics <i className="bi bi-chevron-down" style={styles.dropdownArrow}></i>
            </a>

            <a 
              href="#notifications" 
              style={styles.navLink(activeTab === 'Notifications', hoveredNav === 'Notifications')}
              onMouseEnter={() => setHoveredNav('Notifications')}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={(e) => { e.preventDefault(); setActiveTab('Notifications'); }}
            >
              Notice Board
            </a>
          </nav>
        </div>

        {/* Right Side: Switcher, Bell, Theme, Profile & Signout Button */}
        <div style={styles.topBarRight}>
          
          {/* Mobile hamburger menu toggle */}
          <button 
            style={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={mobileMenuOpen ? 'bi bi-x-lg' : 'bi bi-list'}></i>
          </button>

          {/* Theme Toggle Button (Light / Dark Mode Toggler) */}
          <button 
            style={styles.themeButton}
            onClick={() => setDarkMode(!darkMode)}
            onMouseEnter={() => setHoveredThemeBtn(true)}
            onMouseLeave={() => setHoveredThemeBtn(false)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
          </button>

          {/* Notifications Alert Bell */}
          <button style={styles.bellButton} onClick={() => setActiveTab('Notifications')}>
            <i className="bi bi-bell"></i>
            {pendingLeaves.length > 0 && <span style={styles.bellBadge}></span>}
          </button>

          {/* Profile Circle Logo */}
          <div style={styles.profileAvatar} title="Admin Account">
            AD
          </div>

          {/* Sign Out Button (Styled as Deel's "Book a demo" pill button) */}
          <button 
            style={styles.btnSignOut(hoveredBtn)}
            onMouseEnter={() => setHoveredBtn(true)}
            onMouseLeave={() => setHoveredBtn(false)}
            onClick={() => {
              alert('Signing out from Admin Portal...');
              localStorage.removeItem('dayflow_token');
              localStorage.removeItem('dayflow_user');
              window.location.reload();
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* MOBILE NAV DRAWER */}
      {mobileMenuOpen && (
        <div style={styles.mobileDrawer}>
          {['Dashboard', 'Directory', 'Attendance', 'Leaves', 'Payroll', 'Reports', 'Notifications'].map(tab => (
            <a
              key={tab}
              href={`#${tab.toLowerCase()}`}
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: activeTab === tab ? '#2563EB' : colors.text,
                textDecoration: 'none',
                padding: '8px 0',
                borderBottom: `1px solid ${colors.border}`,
                transition: 'color 0.2s',
              }}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
            >
              {tab === 'Leaves' ? 'Leave Approvals' : tab === 'Reports' ? 'Analytics' : tab === 'Notifications' ? 'Notice Board' : tab}
            </a>
          ))}
          
          {/* Mobile Theme Toggle Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>Theme (Dark / Light)</span>
            <button 
              style={{ ...styles.themeButton, width: '48px', height: '36px', borderRadius: '18px' }}
              onClick={() => setDarkMode(!darkMode)}
            >
              <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
            </button>
          </div>

          <button 
            style={{
              backgroundColor: '#B42318',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '24px',
              padding: '12px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onClick={() => {
              alert('Signing out...');
              localStorage.removeItem('dayflow_token');
              localStorage.removeItem('dayflow_user');
              window.location.reload();
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            Sign Out
          </button>
        </div>
      )}

      {/* 2. SCROLLABLE CONTENT BODY */}
      <div style={styles.contentContainer}>
        
        {/* Welcome & Meta Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: colors.text, margin: '0 0 6px 0', letterSpacing: '-0.5px', transition: 'color 0.3s' }}>
              Welcome Back, Admin
            </h1>
            <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0, transition: 'color 0.3s' }}>
              Every workday, perfectly aligned. Showing view context: **{activeTab === 'Leaves' ? 'Leave Approvals' : activeTab === 'Reports' ? 'Analytics' : activeTab === 'Notifications' ? 'Notice Board' : activeTab}**.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Quick Context Searchable Switcher (Relocated & Upgraded) */}
            <div 
              id="custom-switcher"
              style={{ 
                position: 'relative',
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: colors.cardBg, 
                border: `1px solid ${colors.border}`, 
                padding: '6px 16px', 
                borderRadius: '24px', 
                boxShadow: '0 1px 2px rgba(16,24,40,0.05)', 
                transition: 'all 0.3s',
                zIndex: 950
              }}
            >
              <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="bi bi-person-circle" style={{ color: colors.accent }}></i> Switcher:
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Search and choose..."
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    color: colors.text,
                    fontWeight: '600',
                    outline: 'none',
                    width: '160px',
                    fontFamily: 'inherit'
                  }}
                  value={switcherOpen ? switcherSearch : (employees.find(e => (e.employeeId || e.id) === selectedEmployeeId) ? `${employees.find(e => (e.employeeId || e.id) === selectedEmployeeId).firstName} ${employees.find(e => (e.employeeId || e.id) === selectedEmployeeId).lastName}` : '')}
                  onChange={(e) => {
                    setSwitcherSearch(e.target.value);
                    setSwitcherOpen(true);
                  }}
                  onFocus={() => {
                    setSwitcherOpen(true);
                    setSwitcherSearch('');
                  }}
                />
                
                {selectedEmployeeId ? (
                  <button
                    type="button"
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: colors.textMuted,
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmployeeId('');
                      setSwitcherSearch('');
                      setSwitcherOpen(false);
                    }}
                    title="Clear Context"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                ) : (
                  <i className="bi bi-chevron-down" style={{ fontSize: '10px', color: colors.textMuted }}></i>
                )}
              </div>

              {/* SEARCH DROPDOWN MENU */}
              {switcherOpen && (
                <div style={{
                  position: 'absolute',
                  top: '42px',
                  left: 0,
                  right: 0,
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '6px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  {employees.filter(emp => {
                    const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                    const q = switcherSearch.toLowerCase();
                    return name.includes(q) || (emp.employeeId || emp.id).toLowerCase().includes(q);
                  }).length === 0 ? (
                    <div style={{ padding: '10px 16px', fontSize: '13px', color: colors.textMuted, textAlign: 'center' }}>
                      No staff profiles found.
                    </div>
                  ) : (
                    employees.filter(emp => {
                      const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                      const q = switcherSearch.toLowerCase();
                      return name.includes(q) || (emp.employeeId || emp.id).toLowerCase().includes(q);
                    }).map(emp => {
                      const empId = emp.employeeId || emp.id;
                      const isSelected = selectedEmployeeId === empId;
                      return (
                        <div
                          key={empId}
                          onClick={() => {
                            setSelectedEmployeeId(empId);
                            setSwitcherOpen(false);
                            setSwitcherSearch('');
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#F2F4F7'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? (darkMode ? '#1E3A8A' : '#EFF8FF') : 'transparent'}
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            color: colors.text,
                            cursor: 'pointer',
                            backgroundColor: isSelected ? (darkMode ? '#1E3A8A' : '#EFF8FF') : 'transparent',
                            fontWeight: isSelected ? '700' : '500',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <span>{emp.firstName} {emp.lastName}</span>
                          <span style={{ fontSize: '11px', color: colors.textMuted }}>{emp.departmentName || 'Ops'}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={fetchDashboardData}
              style={{
                backgroundColor: colors.cardBg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '24px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.cardBg}
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh Data
            </button>
          </div>
        </div>

        {/* Backend Connection Warning Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '20px' }}></i>
            <div>
              <strong style={{ display: 'block', fontWeight: '700', marginBottom: '2px' }}>
                Microservices Connection Status (Failed to Fetch)
              </strong>
              <span>
                The gateway API at <code>{API_BASE_URL}</code> is currently unreachable. Start the backend microservices to process live database records. Currently viewing layout.
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
                backgroundColor: darkMode ? '#1E3A8A' : '#EFF8FF',
                color: darkMode ? '#93C5FD' : '#175CD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}>
                {switcherDetails.firstName?.[0]}{switcherDetails.lastName?.[0]}
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: colors.text, transition: 'color 0.3s' }}>
                  Context Snapshot: {switcherDetails.firstName} {switcherDetails.lastName}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: colors.textMuted, transition: 'color 0.3s' }}>
                  {switcherDetails.designationTitle || 'Staff'} • {switcherDetails.departmentName || 'Operations'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div><strong>Phone:</strong> {switcherDetails.phone || 'N/A'}</div>
              <div><strong>Joining:</strong> {switcherDetails.joiningDate || 'N/A'}</div>
              <button 
                style={{
                  backgroundColor: darkMode ? '#374151' : '#F2F4F7',
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={() => setSelectedEmployeeId('')}
              >
                Close Context
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && employees.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: colors.textMuted }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Synchronizing with Spring Boot endpoints...</span>
          </div>
        ) : (
          <>
            {/* KPI METRIC ROW (Visible on Dashboard Tab) */}
            {activeTab === 'Dashboard' && (
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
                  <div style={styles.kpiIconBox(colors.kpiIconBg, colors.kpiIconColor)}>
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
                  <div style={styles.kpiIconBox(darkMode ? '#0F3C24' : '#ECFDF3', darkMode ? '#86EFAC' : '#027A48')}>
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
                  <div style={styles.kpiIconBox(darkMode ? '#422F00' : '#FFFAE6', darkMode ? '#FFAB00' : '#FF8F00')}>
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
                  <div style={styles.kpiIconBox(darkMode ? '#2E195A' : '#F4F3FF', darkMode ? '#C084FC' : '#5925DC')}>
                    <i className="bi bi-percent"></i>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEWS RENDERING */}
            
            {/* VIEW 1: DASHBOARD (SPLIT LAYOUT) */}
            {activeTab === 'Dashboard' && (
              <div style={styles.gridContainer}>
                
                {/* Left side: Pending Leaves and Employee Directory Snapshot */}
                <div>
                  
                  {/* Pending Leaves List */}
                  <div style={styles.widgetCard}>
                    <div style={styles.widgetHeader}>
                      <h3 style={styles.widgetTitle}>Pending Leave Requests ({pendingLeaves.length})</h3>
                      <span style={{ ...styles.badge(darkMode ? '#1E3A8A' : '#EFF8FF', darkMode ? '#93C5FD' : '#175CD3'), cursor: 'pointer' }} onClick={() => setActiveTab('Leaves')}>
                        View Full Queue
                      </span>
                    </div>

                    {pendingLeaves.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px 16px', color: colors.textMuted }}>
                        <i className="bi bi-check-circle-fill" style={{ color: '#039855', fontSize: '28px', display: 'block', marginBottom: '10px' }}></i>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>No pending leave approvals.</span>
                      </div>
                    ) : (
                      <div style={styles.tableResponsiveWrapper}>
                        <table style={styles.deelTable}>
                          <thead>
                            <tr style={styles.tableHeadRow}>
                              <th style={styles.tableHeadCell}>Employee</th>
                              <th style={styles.tableHeadCell}>Leave Type</th>
                              <th style={styles.tableHeadCell}>Date Range</th>
                              <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Workflow</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingLeaves.slice(0, 3).map(leave => (
                              <tr key={leave.leaveId || leave.id} style={styles.tableBodyRow}>
                                <td style={styles.tableBodyCell}>
                                  <strong>{leave.employeeName || `${leave.firstName} ${leave.lastName}`}</strong>
                                </td>
                                <td style={styles.tableBodyCell}>
                                  <span style={styles.badge(darkMode ? '#374151' : '#F2F4F7', colors.text)}>
                                    {leave.leaveTypeName || leave.type}
                                  </span>
                                </td>
                                <td style={styles.tableBodyCell}>{leave.startDate} to {leave.endDate}</td>
                                <td style={{ ...styles.tableBodyCell, textAlign: 'right' }}>
                                  <button style={styles.btnSuccess} onClick={() => handleApproveLeave(leave.leaveId || leave.id)}>Approve</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Directory Snapshot */}
                  <div style={styles.widgetCard}>
                    <div style={styles.widgetHeader}>
                      <h3 style={styles.widgetTitle}>Employee Database Directory</h3>
                      <button 
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                        onClick={() => setActiveTab('Directory')}
                      >
                        View All Directory →
                      </button>
                    </div>

                    <div style={styles.tableResponsiveWrapper}>
                      <table style={styles.deelTable}>
                        <thead>
                          <tr style={styles.tableHeadRow}>
                            <th style={styles.tableHeadCell}>Name</th>
                            <th style={styles.tableHeadCell}>Department</th>
                            <th style={styles.tableHeadCell}>Designation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.slice(0, 4).map(emp => (
                            <tr key={emp.employeeId || emp.id} style={styles.tableBodyRow}>
                              <td style={styles.tableBodyCell}>
                                <strong>{emp.firstName} {emp.lastName}</strong>
                              </td>
                              <td style={styles.tableBodyCell}>{emp.departmentName || emp.deptName || 'N/A'}</td>
                              <td style={styles.tableBodyCell}>{emp.designationTitle || emp.title || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Right side: Attendance breakdown and Mini analytics */}
                <div>
                  
                  {/* Today's Attendance breakdown */}
                  <div style={styles.widgetCard}>
                    <div style={styles.widgetHeader}>
                      <h3 style={styles.widgetTitle}>Attendance Breakdown</h3>
                    </div>
                    
                    <div style={styles.progressBarContainer}>
                      <div style={styles.progressBarWrapper}>
                        <div style={styles.progressBarLabelRow}>
                          <span>Present</span>
                          <strong>{attendanceCounts.present}</strong>
                        </div>
                        <div style={styles.progressBarTrack}>
                          <div style={styles.progressBarFill(employees.length > 0 ? (attendanceCounts.present / employees.length) * 100 : 0, '#027A48')}></div>
                        </div>
                      </div>

                      <div style={styles.progressBarWrapper}>
                        <div style={styles.progressBarLabelRow}>
                          <span>Half-Day</span>
                          <strong>{attendanceCounts.halfDay}</strong>
                        </div>
                        <div style={styles.progressBarTrack}>
                          <div style={styles.progressBarFill(employees.length > 0 ? (attendanceCounts.halfDay / employees.length) * 100 : 0, '#FFAB00')}></div>
                        </div>
                      </div>

                      <div style={styles.progressBarWrapper}>
                        <div style={styles.progressBarLabelRow}>
                          <span>Absent</span>
                          <strong>{attendanceCounts.absent}</strong>
                        </div>
                        <div style={styles.progressBarTrack}>
                          <div style={styles.progressBarFill(employees.length > 0 ? (attendanceCounts.absent / employees.length) * 100 : 0, '#B42318')}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SVG mini trends */}
                  <div style={styles.widgetCard}>
                    <h3 style={{ ...styles.widgetTitle, marginBottom: '20px' }}>Weekly Attendance</h3>
                    <div style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px 12px', backgroundColor: colors.chartBg, transition: 'all 0.3s' }}>
                      <svg viewBox="0 0 300 100" style={{ width: '100%', height: '80px' }}>
                        <line x1="0" y1="20" x2="300" y2="20" stroke={darkMode ? '#374151' : '#F2F4F7'} />
                        <line x1="0" y1="50" x2="300" y2="50" stroke={darkMode ? '#374151' : '#F2F4F7'} />
                        <line x1="0" y1="80" x2="300" y2="80" stroke={darkMode ? '#374151' : '#F2F4F7'} />
                        <path d="M 10 30 L 58 20 L 106 45 L 154 23 L 202 15 L 250 80 L 290 70" fill="none" stroke="#2563EB" strokeWidth="2.5" />
                        <circle cx="10" cy="30" r="4" fill={colors.cardBg} stroke="#2563EB" strokeWidth="2" />
                        <circle cx="58" cy="20" r="4" fill={colors.cardBg} stroke="#2563EB" strokeWidth="2" />
                        <circle cx="106" cy="45" r="4" fill={colors.cardBg} stroke="#2563EB" strokeWidth="2" />
                        <circle cx="154" cy="23" r="4" fill={colors.cardBg} stroke="#2563EB" strokeWidth="2" />
                        <circle cx="202" cy="15" r="4" fill={colors.cardBg} stroke="#2563EB" strokeWidth="2" />
                        <circle cx="250" cy="80" r="4" fill={colors.cardBg} stroke="#2563EB" strokeWidth="2" />
                        <circle cx="290" cy="70" r="4" fill={colors.cardBg} stroke="#2563EB" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* VIEW 2: DIRECTORY */}
            {activeTab === 'Directory' && (
              <EmployeeList 
                employees={employees} 
                setEmployees={setEmployees} 
                darkMode={darkMode} 
                colors={colors} 
              />
            )}

            {/* VIEW 3: ATTENDANCE */}
            {activeTab === 'Attendance' && (
              <AdminAttendance 
                attendance={attendance} 
                setAttendance={setAttendance} 
                employees={employees} 
                darkMode={darkMode} 
                colors={colors} 
              />
            )}

            {/* VIEW 4: LEAVES */}
            {activeTab === 'Leaves' && (
              <LeaveApprovals 
                leaves={leaves} 
                setLeaves={setLeaves} 
                employees={employees} 
                darkMode={darkMode} 
                colors={colors} 
              />
            )}

            {/* VIEW 5: PAYROLL */}
            {activeTab === 'Payroll' && (
              <AdminPayroll 
                employees={employees} 
                setEmployees={setEmployees} 
                darkMode={darkMode} 
                colors={colors} 
              />
            )}

            {/* VIEW 6: REPORTS / ANALYTICS */}
            {activeTab === 'Reports' && (
              <Reports 
                employees={employees} 
                leaves={leaves} 
                darkMode={darkMode} 
                colors={colors} 
              />
            )}

            {/* VIEW 7: NOTIFICATIONS / BROADCAST */}
            {activeTab === 'Notifications' && (
              <Notifications 
                notifications={notifications} 
                setNotifications={setNotifications} 
                darkMode={darkMode} 
                colors={colors} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
