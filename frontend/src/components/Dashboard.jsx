import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './Dashboard.css';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

function Dashboard({ userName = 'nombre del usuario', userData = null, onLogout = () => {}, onUpdateUserData = () => {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (section) => {
    const routes = {
      home: '/',
      memoria: '/memoria',
      'ver-memorias': '/ver-memorias',
      trabajos: '/trabajos',
      registros: '/registros',
      grupo: '/grupo',
    };
    navigate(routes[section]);
  };

  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/memoria') return 'memoria';
    if (path === '/ver-memorias') return 'ver-memorias';
    if (path === '/trabajos') return 'trabajos';
    if (path === '/registros') return 'registros';
    if (path === '/grupo') return 'grupo';
    return 'home';
  };

  return (
    <div className="dashboard">
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        onLogout={onLogout}
        userName={userName}
        userData={userData}
        onUpdateUserData={onUpdateUserData}
      />
      <div className="dashboard-container">
        {sidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar 
          onNavigate={(section) => {
            handleNavigate(section);
            if (window.innerWidth <= 768) {
              setSidebarOpen(false);
            }
          }} 
          activeSection={getActiveSection()}
          isOpen={sidebarOpen}
        />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;
