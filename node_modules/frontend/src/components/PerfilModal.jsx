import React, { useState, useEffect } from 'react';
import { X, User, Lock, Eye, EyeOff } from 'lucide-react';
import './PerfilModal.css';
import { getPerfil, actualizarPerfil, getUser, cambiarContrasena } from '../services/api';
import Alert from './Alert';

const PerfilModal = ({ isOpen, onClose, userData, onUpdateUserData = () => {} }) => {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (isOpen && userData) {
      loadPerfil();
    }
  }, [isOpen, userData]);

  const loadPerfil = async () => {
    setIsLoading(true);
    setAlert(null);
    try {
      const user = getUser();
      if (user && user.oidpersona) {
        const perfilData = await getPerfil(user.oidpersona);
        setFormData(perfilData);
      } else {
        // Si no hay oidpersona, usar los datos básicos del localStorage
        setFormData(userData);
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
      setAlert({ type: 'error', message: 'Error al cargar el perfil' });
      // Usar datos del userData como fallback
      setFormData(userData);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  
  if (!formData) return null;

  const user = formData;

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setAlert(null);
    try {
      const user = getUser();
      if (user && user.oidpersona) {
        const response = await actualizarPerfil(user.oidpersona, formData);
        // Actualizar los datos del usuario en toda la aplicación
        onUpdateUserData(formData);
        setAlert({ type: 'success', message: 'Perfil actualizado correctamente' });
        // Cerrar inmediatamente
        onClose();
      } else {
        throw new Error('No se encontró el ID del usuario');
      }
    } catch (err) {
      console.error('Error guardando perfil:', err);
      setAlert({ type: 'error', message: err.message || 'Error al guardar el perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setAlert(null);
    
    console.log('=== CAMBIO DE CONTRASEÑA - Inicio ===');
    console.log('Datos del formulario:', {
      currentPasswordLength: passwordData.currentPassword.length,
      newPasswordLength: passwordData.newPassword.length,
      confirmPasswordLength: passwordData.confirmPassword.length
    });
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setAlert({ type: 'error', message: 'Todos los campos de contraseña son requeridos' });
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      setAlert({ type: 'error', message: 'La nueva contraseña debe ser diferente a la actual' });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({ type: 'error', message: 'Las contraseñas nuevas no coinciden' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setAlert({ type: 'error', message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = getUser();
      if (!user || !user.oidpersona) {
        throw new Error('No se encontró el ID del usuario');
      }
      
      console.log('Cambiando contraseña para usuario:', user.oidpersona);
      console.log('Enviando datos al backend...');
      
      const response = await cambiarContrasena(user.oidpersona, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      console.log('Respuesta del backend:', response);
      console.log('=== CAMBIO DE CONTRASEÑA - Éxito ===');
      
      setAlert({ type: 'success', message: '¡Contraseña actualizada exitosamente!' });
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswords({ current: false, new: false, confirm: false });
      
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    } catch (err) {
      console.error('=== CAMBIO DE CONTRASEÑA - Error ===');
      console.error('Error al cambiar contraseña:', err);
      setAlert({ type: 'error', message: err.message || 'Error al cambiar la contraseña' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="perfil-modal-overlay" onClick={onClose}>
      <div className="perfil-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="perfil-modal-header">
          <h2>Perfil de Usuario</h2>
          <button className="perfil-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {alert && (
          <Alert 
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="perfil-modal-body">
          {/* Información Personal */}
          <div className="perfil-section">
            <h3 className="perfil-section-title">
              <User size={20} />
              Información Personal
            </h3>
            <div className="perfil-grid">
              <div className="perfil-field">
                <label>Nombre</label>
                <input
                  type="text"
                  value={user.nombre || ''}
                  className="perfil-input"
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                />
              </div>
              <div className="perfil-field">
                <label>Apellido</label>
                <input
                  type="text"
                  value={user.apellido || ''}
                  className="perfil-input"
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                />
              </div>
              <div className="perfil-field full-width">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={user.correo || ''}
                  className="perfil-input perfil-email-input"
                  disabled
                />
              </div>
              <div className="perfil-field full-width">
                <button 
                  className="btn-change-password"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  <Lock size={16} />
                  Cambiar Contraseña
                </button>
              </div>
              {showChangePassword && (
                <div className="perfil-field full-width password-section">
                  <div className="password-grid">
                    <div className="password-field">
                      <label>Contraseña Actual</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          className="perfil-input"
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        >
                          {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="password-field">
                      <label>Nueva Contraseña</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          className="perfil-input"
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        >
                          {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="password-field">
                      <label>Confirmar Contraseña</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          className="perfil-input"
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        >
                          {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="password-actions">
                      <button 
                        type="button"
                        className="btn-password-cancel" 
                        onClick={() => setShowChangePassword(false)}
                        disabled={isLoading}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="button"
                        className="btn-password-save" 
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Guardando...' : 'Guardar Contraseña'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="perfil-modal-footer">
          <button className="btn-perfil-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-perfil-save" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfilModal;
