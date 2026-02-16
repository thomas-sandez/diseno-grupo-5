import React, { useState } from 'react';
import './AgregarTrabajoRealizadoModal.css';
import { X } from 'lucide-react';
import Alert from './Alert';

const AgregarTrabajoRealizadoModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    titulo: '',
    issn: '',
    editorial: '',
    pais: ''
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      newErrors.nombre = 'El nombre de la revista es requerido';
    }
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título del trabajo es requerido';
    }
    
    if (!formData.issn.trim()) {
      newErrors.issn = 'El ISSN es requerido';
    }
    
    if (!formData.editorial.trim()) {
      newErrors.editorial = 'La editorial es requerida';
    }
    
    if (!formData.pais.trim()) {
      newErrors.pais = 'El país es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert(null);
    
    if (validate()) {
      const nuevoTrabajo = {
        id: Date.now(),
        ...formData
      };
      
      onAdd(nuevoTrabajo);
      
      setFormData({
        nombre: '',
        titulo: '',
        issn: '',
        editorial: '',
        pais: ''
      });
      setErrors({});
      setAlert({
        type: 'success',
        message: '¡Trabajo realizado agregado exitosamente!'
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setAlert({
        type: 'warning',
        message: 'Por favor completa todos los campos requeridos correctamente.'
      });
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      titulo: '',
      issn: '',
      editorial: '',
      pais: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="atrm-overlay" onClick={handleClose}>
      <div className="atrm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="atrm-header">
          <h2>Agregar Trabajo Realizado</h2>
          <button className="atrm-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>
        {alert && (
          <Alert 
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={alert.type === 'success'}
          />
        )}
        <form onSubmit={handleSubmit} className="atrm-form">
          <div className="atrm-form-group">
            <label htmlFor="nombre">Nombre Revista *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'error' : ''}
              placeholder="Ingrese el nombre de la revista"
            />
            {errors.nombre && <span className="atrm-error">{errors.nombre}</span>}
          </div>

          <div className="atrm-form-group">
            <label htmlFor="titulo">Título del Trabajo *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={errors.titulo ? 'error' : ''}
              placeholder="Ingrese el título del trabajo"
            />
            {errors.titulo && <span className="atrm-error">{errors.titulo}</span>}
          </div>

          <div className="atrm-form-group">
            <label htmlFor="issn">ISSN *</label>
            <input
              type="text"
              id="issn"
              name="issn"
              value={formData.issn}
              onChange={handleChange}
              className={errors.issn ? 'error' : ''}
              placeholder="Ingrese el ISSN"
            />
            {errors.issn && <span className="atrm-error">{errors.issn}</span>}
          </div>

          <div className="atrm-form-group">
            <label htmlFor="editorial">Editorial *</label>
            <input
              type="text"
              id="editorial"
              name="editorial"
              value={formData.editorial}
              onChange={handleChange}
              className={errors.editorial ? 'error' : ''}
              placeholder="Ingrese la editorial"
            />
            {errors.editorial && <span className="atrm-error">{errors.editorial}</span>}
          </div>

          <div className="atrm-form-group">
            <label htmlFor="pais">País *</label>
            <input
              type="text"
              id="pais"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              className={errors.pais ? 'error' : ''}
              placeholder="Ingrese el país"
            />
            {errors.pais && <span className="atrm-error">{errors.pais}</span>}
          </div>

          <div className="atrm-buttons">
            <button type="button" className="atrm-btn-cancel" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="atrm-btn-submit">
              Agregar Trabajo Realizado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarTrabajoRealizadoModal;
