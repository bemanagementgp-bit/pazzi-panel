import { useState } from 'react';
import { useAuth } from './hooks/useAuth.js';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function App() {
  const { isAuthenticated, admin, login, logout, isAdmin } = useAuth();
  const [key, setKey] = useState(0);

  const handleLogin = (email, token, adminData) => {
    login(email, token, adminData);
    setKey((prev) => prev + 1);
  };

  const handleLogout = () => {
    logout();
    setKey((prev) => prev + 1);
  };

  return (
    <div key={key}>
      {isAuthenticated && admin ? (
        <AdminPage admin={admin} onLogout={handleLogout} isAdmin={isAdmin()} />
      ) : (
        <LoginPage onLoginSuccess={handleLogin} />
      )}
    </div>
  );
}

export default App;
