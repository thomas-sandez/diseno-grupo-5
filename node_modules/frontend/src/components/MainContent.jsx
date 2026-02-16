import React from 'react';
import './MainContent.css';

function MainContent({ userName = 'nombre del usuario', activeSection = 'home' }) {
  return (
    <main className="main-content">
      {activeSection === 'home' ? (
        <div className="welcome-section">
          <h1>Bienvenido, <span className="username"><b>{userName}</b></span></h1>
        </div>
      ) : (
        <div>{/* Aquí irán otros componentes según la sección */}</div>
      )}
    </main>
  );
}

export default MainContent;
