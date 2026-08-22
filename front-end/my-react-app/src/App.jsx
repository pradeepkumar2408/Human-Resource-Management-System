
import { useState } from 'react';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import ForgotPassword from './Components/ForgotPassword';
import VerifyEmail from './Components/VerifyEmail';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [userData, setUserData] = useState(null);

  const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8081';

  const handleLoginSuccess = (data) => {
    setUserData(data);
    setCurrentPage('dashboard');
  };

  const handleSignUpSuccess = (data, email) => {
    setRegisteredEmail(email);
    setCurrentPage('verify-email');
  };

  return (
    <>
<<<<<<< HEAD
      {currentPage === 'login' && (
        <Login
          apiBaseUrl={API_BASE_URL}
          onSignUp={() => setCurrentPage('signup')}
          onForgotPassword={() => setCurrentPage('forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === 'signup' && (
        <SignUp
          apiBaseUrl={API_BASE_URL}
          onNavigateToLogin={() => setCurrentPage('login')}
          onSignUpSuccess={handleSignUpSuccess}
        />
      )}

      {currentPage === 'forgot-password' && (
        <ForgotPassword
          apiBaseUrl={API_BASE_URL}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'verify-email' && (
        <VerifyEmail
          apiBaseUrl={API_BASE_URL}
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
=======
      <AdminDashboard/>
    </> 
>>>>>>> e0ab246a04d250a619ac0f570ceca22621ceae32
  );
}

export default App;
