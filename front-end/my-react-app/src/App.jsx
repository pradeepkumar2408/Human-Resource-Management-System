import { useState } from 'react';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import ForgotPassword from './Components/ForgotPassword';
import VerifyEmail from './Components/VerifyEmail';
import EmployeeDashboard from './Components/EmployeeDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [userData, setUserData] = useState(null);

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
          onSignUp={() => setCurrentPage('signup')}
          onForgotPassword={() => setCurrentPage('forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === 'signup' && (
        <SignUp
          onNavigateToLogin={() => setCurrentPage('login')}
          onSignUpSuccess={handleSignUpSuccess}
        />
      )}

      {currentPage === 'forgot-password' && (
        <ForgotPassword
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'verify-email' && (
        <VerifyEmail
          email={registeredEmail}
          onNavigateToLogin={() => setCurrentPage('login')}
          onVerificationSuccess={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'dashboard' && (
        <EmployeeDashboard
          onNavigate={(page) => console.log('Navigate to:', page)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
