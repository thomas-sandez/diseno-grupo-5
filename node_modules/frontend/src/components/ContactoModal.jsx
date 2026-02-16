import React, { useState } from 'react';
import { X } from 'lucide-react';
import './ContactoModal.css';
import Alert from './Alert';

function ContactoModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.asunto.trim()) {
      newErrors.asunto = 'El asunto es requerido';
    }
    
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert(null);
    
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'warning', message: 'Por favor complete todos los campos correctamente' });
      return;
    }
    
    // Aquí iría la lógica para enviar el formulario
    console.log('Enviando mensaje:', formData);
    
    setAlert({ type: 'success', message: 'Mensaje enviado correctamente' });
    
    // Resetear formulario y cerrar modal después de mostrar el mensaje
    setTimeout(() => {
      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
      });
      setErrors({});
      onClose();
    }, 1500);
  };

  const handleCancel = () => {
    setFormData({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="contacto-modal-overlay" onClick={handleCancel}>
      <div className="contacto-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="contacto-modal-header">
          <h2>Contacto</h2>
          <button className="contacto-close-btn" onClick={handleCancel}>
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

        <form className="contacto-form" onSubmit={handleSubmit}>
          <div className="contacto-form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'error' : ''}
            />
            {errors.nombre && (
              <span className="contacto-error-message">⚠ {errors.nombre}</span>
            )}
          </div>

          <div className="contacto-form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="contacto-error-message">⚠ {errors.email}</span>
            )}
          </div>

          <div className="contacto-form-group">
            <label htmlFor="asunto">Asunto *</label>
            <input
              type="text"
              id="asunto"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              className={errors.asunto ? 'error' : ''}
            />
            {errors.asunto && (
              <span className="contacto-error-message">⚠ {errors.asunto}</span>
            )}
          </div>

          <div className="contacto-form-group">
            <label htmlFor="mensaje">Mensaje *</label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              className={errors.mensaje ? 'error' : ''}
              rows="5"
            />
            {errors.mensaje && (
              <span className="contacto-error-message">⚠ {errors.mensaje}</span>
            )}
          </div>

          <div className="contacto-form-actions">
            <button type="button" className="contacto-cancel-btn" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="contacto-submit-btn">
              Enviar mensaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactoModal;
