import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const navigate = useNavigate();

  const handleAboutClick = () => {
    navigate('/acerca-de');
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p className="footer-copyright">© 2025 Universidad Tecnológica Nacional - Facultad Regional La Plata</p>
          <p className="footer-detail">Comisión S32 | Diseño de Sistemas de Información</p>
        </div>
        <div className="footer-right">
          <button 
            className="footer-link-btn" 
            onClick={handleAboutClick}
          >
            Acerca de Nosotros
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
