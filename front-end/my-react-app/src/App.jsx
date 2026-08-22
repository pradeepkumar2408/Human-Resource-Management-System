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

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [userData, setUserData] = useState(null);

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
    setCurrentPage('dashboard');
  };

  const handleSignUpSuccess = (data, email) => {
    setRegisteredEmail(email);
    setCurrentPage('verify-email');
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
    </>
  );
}

export default App;
