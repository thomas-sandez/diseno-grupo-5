import React, { useState } from 'react';
import { Menu, User, ChevronDown, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import PerfilModal from './PerfilModal';

function Header({ onLogout = () => {}, onMenuToggle = () => {}, userName = 'Usuario', userData = null, onUpdateUserData = () => {} }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const navigate = useNavigate();
  
  // Logo UTN en color negro
  const utnLogoUrl = 'https://www.utn.edu.ar/images/04-LOGO-UTN-WEB-NEG-BAJADA.png';

  const handleOptionClick = (option) => {
    setShowDropdown(false);
    if (option === 'perfil') {
      setShowPerfilModal(true);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" title="Menú" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <img 
          src={utnLogoUrl} 
          alt="UTN Logo" 
          className="logo logo-black" 
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <div className="header-right">
        <div className="user-card" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="user-avatar">
            {userData?.imagenPerfil ? (
              <img src={userData.imagenPerfil} alt="Perfil" className="user-avatar-image" />
            ) : (
              <User size={20} />
            )}
          </div>
          <span className="user-name">{userName}</span>
          <ChevronDown size={18} className={`user-chevron ${showDropdown ? 'rotated' : ''}`} />
          
          {showDropdown && (
            <div className="user-dropdown">
              <button onClick={(e) => { e.stopPropagation(); handleOptionClick('perfil'); }} className="dropdown-item">
                <UserCircle size={16} />
                <span>Ver perfil</span>
              </button>
              <div className="dropdown-divider"></div>
              <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="dropdown-item logout-item">
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <PerfilModal 
        isOpen={showPerfilModal} 
        onClose={() => setShowPerfilModal(false)} 
        userData={userData}
        onUpdateUserData={onUpdateUserData}
      />
    </header>
  );
}

export default Header;
