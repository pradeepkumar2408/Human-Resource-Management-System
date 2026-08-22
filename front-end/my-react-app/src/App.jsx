import { useState } from 'react';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import ForgotPassword from './Components/ForgotPassword';
import VerifyEmail from './Components/VerifyEmail';
import EmployeeDashboard from './Components/EmployeeDashboard';
import Profile from './Components/Profile';
import Attendance from './Components/Attendance';
import LeaveManagement from './Components/LeaveManagement';
import Payroll from './Components/Payroll';
import Notifications from './Components/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [userData, setUserData] = useState(null);

  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname === '/signup' || window.location.href.includes('/signup')) {
      localStorage.removeItem('dayflow_token');
      localStorage.removeItem('dayflow_user');
      return 'signup';
    }

    const savedUser = localStorage.getItem('dayflow_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const role = (parsed.role || '').toUpperCase();
        if (role === 'ADMIN' || role === 'HR') return 'admin-dashboard';
        return 'dashboard';
      } catch (e) {
        return 'login';
      }
    }
    return 'login';
  });

  // Persistent Theme State across all pages
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dayflow_theme') || 'dark';
  });

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('dayflow_theme', nextTheme);
  };

  const handleLoginSuccess = (data) => {
    setUserData(data);
    const role = (data.user?.role || '').toUpperCase();
    if (role === 'ADMIN' || role === 'HR') {
      setCurrentPage('admin-dashboard');
    } else if (role === 'EMPLOYEE') {
      setCurrentPage('dashboard');
    } else {
      alert(`Invalid user privileges: '${role}' is not a recognized role.`);
      handleLogout();
    }
  };

  const handleSignUpSuccess = (data, email) => {
    setRegisteredEmail(email);
    alert('Account activated successfully! You can now log in with your password.');
    setCurrentPage('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
    setUserData(null);
    setCurrentPage('login');
  };

  return (
    <>
      {currentPage === 'login' && (
        <Login
          theme={theme}
          onSignUp={() => setCurrentPage('signup')}
          onForgotPassword={() => setCurrentPage('forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === 'signup' && (
        <SignUp
          theme={theme}
          onNavigateToLogin={() => setCurrentPage('login')}
          onSignUpSuccess={handleSignUpSuccess}
        />
      )}

      {currentPage === 'forgot-password' && (
        <ForgotPassword
          theme={theme}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'verify-email' && (
        <VerifyEmail
          theme={theme}
          email={registeredEmail}
          onNavigateToLogin={() => setCurrentPage('login')}
          onVerificationSuccess={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'dashboard' && (
        <EmployeeDashboard
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onNavigate={(page) => setCurrentPage(page)}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'profile' && (
        <Profile
          theme={theme}
          onBackToDashboard={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'attendance' && (
        <Attendance
          theme={theme}
          onBackToDashboard={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'leave' && (
        <LeaveManagement
          theme={theme}
          onBackToDashboard={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'payroll' && (
        <Payroll
          theme={theme}
          onBackToDashboard={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'notifications' && (
        <Notifications
          theme={theme}
          onBackToDashboard={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'admin-dashboard' && (
        <AdminDashboard 
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
