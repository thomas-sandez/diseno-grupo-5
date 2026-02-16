import './App.css'
import React, { useState, useEffect } from 'react';
import { logout as authLogout } from './utils/auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login'
import Register from './components/register'
import Dashboard from './components/Dashboard'
import HomePage from './pages/HomePage'
import TrabajosPage from './pages/TrabajosPage'
import MemoriaPage from './pages/MemoriaPage'
import RegistrosPage from './pages/RegistrosPage'
import GrupoPage from './pages/GrupoPage'
import AcercaDePage from './pages/AcercaDePage'
import VerMemorias from './components/VerMemorias'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { getUser } from './services/api';
import Alert from './components/Alert';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('nombre del usuario');
  const [userData, setUserData] = useState(null);
  const [logoutAlert, setLogoutAlert] = useState(null);

  useEffect(() => {
    // Cargar datos del usuario desde localStorage al iniciar
    const user = getUser();
    if (user) {
      setUserData(user);
      setUserName(user.nombre || user.correo?.split('@')[0] || 'Usuario');
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (name) => {
    const user = getUser();
    setUserData(user);
    setUserName(name || user?.nombre || 'nombre del usuario');
    setIsAuthenticated(true);
  };

  const handleRegister = (name) => {
    const user = getUser();
    setUserData(user);
    setUserName(name || user?.nombre || 'nombre del usuario');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // clear local auth tokens and state
    try { authLogout(); } catch (e) { /* ignore */ }
    setIsAuthenticated(false);
    setUserName('nombre del usuario');
    setUserData(null);
    setLogoutAlert({ type: 'success', message: 'Sesión cerrada con éxito' });
    // Limpiar la alerta después de 3 segundos
    setTimeout(() => {
      setLogoutAlert(null);
    }, 3000);
  };

  const handleUpdateUserData = (newUserData) => {
    setUserData(newUserData);
    setUserName(newUserData.nombre || newUserData.correo?.split('@')[0] || 'Usuario');
    // Actualizar también en localStorage
    const user = getUser();
    if (user) {
      const updatedUser = { ...user, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new Event('userDataUpdated'));
    }
  };

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        {logoutAlert && (
          <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '90%', maxWidth: '500px' }}>
            <Alert 
              type={logoutAlert.type}
              message={logoutAlert.message}
              onClose={() => setLogoutAlert(null)}
              autoClose={true}
              autoCloseDuration={3000}
            />
          </div>
        )}
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Dashboard userName={userName} userData={userData} onLogout={handleLogout} onUpdateUserData={handleUpdateUserData} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/trabajos" element={<TrabajosPage />} />
          <Route path="/memoria" element={<MemoriaPage />} />
          <Route path="/ver-memorias" element={<VerMemorias />} />
          <Route path="/registros" element={<RegistrosPage />} />
          <Route path="/grupo" element={<GrupoPage />} />
          <Route path="/acerca-de" element={<AcercaDePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
