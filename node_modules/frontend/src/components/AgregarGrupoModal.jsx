import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Alert from './Alert';
import './AgregarGrupoModal.css';

const AgregarGrupoModal = ({ isOpen, onClose, onSubmit, grupoToEdit = null }) => {
  const [formData, setFormData] = useState({
    correo: '',
    nombreGrupo: '',
    siglasGrupo: '',
    facultad: '',
    financiamiento: '',
    objetivos: '',
  });

  // Cargar datos del grupo si está en modo edición
  useEffect(() => {
    if (grupoToEdit) {
      setFormData({
        correo: grupoToEdit.correo || '',
        nombreGrupo: grupoToEdit.nombre || '',
        siglasGrupo: grupoToEdit.sigla || '',
        facultad: grupoToEdit.facultadReginalAsignada || '',
        financiamiento: grupoToEdit.fuenteFinanciamiento || '',
        objetivos: grupoToEdit.organigrama || '',
      });
    } else {
      setFormData({
        correo: '',
        nombreGrupo: '',
        siglasGrupo: '',
        facultad: '',
        financiamiento: '',
        objetivos: '',
      });
    }
  }, [grupoToEdit, isOpen]);

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const facultades = [
    'Facultad de Ingeniería',
    'Facultad de Ciencias',
    'Facultad de Humanidades',
    'Facultad de Medicina',
    'Facultad de Derecho',
  ];

  const fuentesFinanciamiento = [
    'Fondos Propios',
    'Subsidio Estatal',
    'Donaciones Privadas',
    'Becas de Investigación',
    'Fondos Internacionales',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.correo.trim()) {
      newErrors.correo = 'Este campo no puede estar vacío';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Ingrese un correo válido';
    }

    if (!formData.nombreGrupo.trim()) {
      newErrors.nombreGrupo = 'Este campo no puede estar vacío';
    }

    if (!formData.siglasGrupo.trim()) {
      newErrors.siglasGrupo = 'Este campo no puede estar vacío';
    }

    if (!formData.facultad) {
      newErrors.facultad = 'Este campo no puede estar vacío';
    }

    if (!formData.financiamiento) {
      newErrors.financiamiento = 'Este campo no puede estar vacío';
    }

    if (!formData.objetivos.trim()) {
      newErrors.objetivos = 'Este campo no puede estar vacío';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({
        type: 'warning',
        message: 'Por favor completa todos los campos requeridos correctamente.'
      });
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }

      setAlert({
        type: 'success',
        message: grupoToEdit ? '¡Grupo actualizado exitosamente!' : '¡Grupo agregado exitosamente!'
      });

      setTimeout(() => {
        setFormData({
          correo: '',
          nombreGrupo: '',
          siglasGrupo: '',
          facultad: '',
          financiamiento: '',
          objetivos: '',
        });
        setErrors({});
        setAlert(null);
        onClose();
      }, 1500);
    } catch (error) {
      let errorMessage = 'Error al guardar el grupo. Por favor intenta nuevamente.';
      const fieldErrors = {};
      
      // Intentar parsear el error del backend
      if (error.message) {
        try {
          const errorData = JSON.parse(error.message);
          
          if (errorData.nombre) {
            fieldErrors.nombreGrupo = 'El nombre del grupo ya está registrado';
          }
          if (errorData.correo) {
            fieldErrors.correo = 'El correo electrónico ya está registrado';
          }
          if (errorData.sigla) {
            fieldErrors.siglasGrupo = 'Las siglas del grupo ya están registradas';
          }
          
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            errorMessage = 'Ya existe un grupo con estos datos';
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (e) {
          // Si no es JSON, usar el mensaje tal cual
          errorMessage = error.message;
        }
      }
      
      setAlert({
        type: 'error',
        message: errorMessage
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      correo: '',
      nombreGrupo: '',
      siglasGrupo: '',
      facultad: '',
      financiamiento: '',
      objetivos: '',
    });
    setErrors({});
    setAlert(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{grupoToEdit ? 'Editar Grupo de Investigación' : 'Añadir Grupo de Investigación'}</h2>
          <button 
            className="modal-close-btn" 
            onClick={handleCancel}
            title="Cerrar"
          >
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

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-column">
            <div className="form-group">
              <label htmlFor="correo">Correo electrónico.</label>
              <input
                id="correo"
                type="email"
                name="correo"
                placeholder="Ingrese su correo"
                value={formData.correo}
                onChange={handleChange}
                className={`form-input ${errors.correo ? 'error' : ''}`}
              />
              {errors.correo && (
                <span className="error-message">
                  {errors.correo}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="nombreGrupo">Nombre del Grupo.</label>
              <input
                id="nombreGrupo"
                type="text"
                name="nombreGrupo"
                placeholder="Ingrese nombre"
                value={formData.nombreGrupo}
                onChange={handleChange}
                className={`form-input ${errors.nombreGrupo ? 'error' : ''}`}
              />
              {errors.nombreGrupo && (
                <span className="error-message">
                  {errors.nombreGrupo}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="siglasGrupo">Siglas del Grupo.</label>
              <input
                id="siglasGrupo"
                type="text"
                name="siglasGrupo"
                placeholder="Ingrese las siglas correspondientes"
                value={formData.siglasGrupo}
                onChange={handleChange}
                className={`form-input ${errors.siglasGrupo ? 'error' : ''}`}
              />
              {errors.siglasGrupo && (
                <span className="error-message">
                  {errors.siglasGrupo}
                </span>
              )}
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label htmlFor="facultad">Seleccione una Facultad Regional.</label>
              <div className="select-wrapper">
                <select
                  id="facultad"
                  name="facultad"
                  value={formData.facultad}
                  onChange={handleChange}
                  className={`form-select ${errors.facultad ? 'error' : ''}`}
                >
                  <option value="">Facultad Regional</option>
                  {facultades.map((fac) => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>
              {errors.facultad && (
                <span className="error-message">
                  {errors.facultad}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="financiamiento">Seleccione una Fuente de Financiamiento.</label>
              <div className="select-wrapper">
                <select
                  id="financiamiento"
                  name="financiamiento"
                  value={formData.financiamiento}
                  onChange={handleChange}
                  className={`form-select ${errors.financiamiento ? 'error' : ''}`}
                >
                  <option value="">Fuente Financiamiento</option>
                  {fuentesFinanciamiento.map((fuente) => (
                    <option key={fuente} value={fuente}>{fuente}</option>
                  ))}
                </select>
              </div>
              {errors.financiamiento && (
                <span className="error-message">
                  {errors.financiamiento}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="objetivos">Objetivos de Desarrollo.</label>
              <textarea
                id="objetivos"
                name="objetivos"
                placeholder="Ingrese los objetivos de desarrollo"
                value={formData.objetivos}
                onChange={handleChange}
                className={`form-textarea ${errors.objetivos ? 'error' : ''}`}
                rows="4"
              />
              {errors.objetivos && (
                <span className="error-message">
                  {errors.objetivos}
                </span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit"
            >
              {grupoToEdit ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarGrupoModal;
