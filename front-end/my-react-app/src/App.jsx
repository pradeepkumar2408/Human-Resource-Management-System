import { useState } from 'react';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import ForgotPassword from './Components/ForgotPassword';
import VerifyEmail from './Components/VerifyEmail';

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
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#000000',
          color: '#FFFFFF',
          fontFamily: "'Inter', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#0A0A0A',
            border: '1px solid #262626',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
              Welcome to Dayflow Dashboard!
            </h1>
            <p style={{ color: '#A1A1AA', fontSize: '14px', marginBottom: '24px' }}>
              Logged in successfully as {userData?.user?.email || userData?.email || 'Employee'}.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('dayflow_token');
                localStorage.removeItem('dayflow_user');
                setCurrentPage('login');
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
