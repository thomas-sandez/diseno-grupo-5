import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Alert from './Alert';
import './AgregarTrabajoModal.css';
import { actualizarTrabajoPresentado, listarGrupos } from '../services/api';

export default function EditarTrabajoPresentadoModal({ isOpen, onClose, onUpdate, trabajo }) {
  const [formData, setFormData] = useState({
    ciudad: '',
    fechaInicio: '',
    nombreReunion: '',
    tituloTrabajo: '',
    GrupoInvestigacion: ''
  });

  const [grupos, setGrupos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!isOpen) return () => { mounted = false };

    setLoadingData(true);
    listarGrupos()
      .then(data => {
        if (!mounted) return;
        setGrupos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error cargando grupos:', err);
        setGrupos([]);
      })
      .finally(() => {
        if (mounted) setLoadingData(false);
      });
    return () => { mounted = false };
  }, [isOpen]);

  // Cargar datos del trabajo cuando se abre el modal
  useEffect(() => {
    if (trabajo && isOpen) {
      setFormData({
        ciudad: trabajo.ciudad || '',
        fechaInicio: trabajo.fechaInicio ? trabajo.fechaInicio.slice(0, 10) : '',
        nombreReunion: trabajo.nombreReunion || '',
        tituloTrabajo: trabajo.tituloTrabajo || '',
        GrupoInvestigacion: trabajo.GrupoInvestigacion || ''
      });
      setAlert(null); // Limpiar alertas al abrir el modal
      setErrors({}); // Limpiar errores al abrir el modal
    }
  }, [trabajo, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.tituloTrabajo.trim()) newErrors.tituloTrabajo = 'El título es requerido';
    if (!formData.fechaInicio) newErrors.fechaInicio = 'La fecha de inicio es requerida';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
    if (!formData.GrupoInvestigacion) newErrors.GrupoInvestigacion = 'Seleccione un grupo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) {
      setAlert({ type: 'warning', message: 'Por favor complete todos los campos requeridos correctamente' });
      return;
    }

    setLoading(true);

    const payload = {
      ciudad: formData.ciudad,
      fechaInicio: formData.fechaInicio,
      nombreReunion: formData.nombreReunion,
      tituloTrabajo: formData.tituloTrabajo,
      GrupoInvestigacion: parseInt(formData.GrupoInvestigacion, 10)
    };

    const trabajoId = trabajo.id || trabajo.oidTrabajoPresentado;

    actualizarTrabajoPresentado(trabajoId, payload)
      .then(updated => {
        setAlert({ type: 'success', message: 'Trabajo actualizado correctamente' });
        setTimeout(() => {
          if (onUpdate) onUpdate(updated);
          onClose && onClose();
        }, 1500);
      })
      .catch(err => {
        let msg = err.message || 'Error al actualizar trabajo';
        try {
          const parsed = JSON.parse(msg);
          if (parsed.detail) msg = parsed.detail;
          else if (typeof parsed === 'object') msg = Object.entries(parsed).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
        } catch (e) {}
        setAlert({ type: 'error', message: msg });
      })
      .finally(() => setLoading(false));
  };

  if (!isOpen) return null;

  return (
    <div className="atm-overlay">
      <div className="atm-modal">
        <div className="atm-header">
          <h2>Editar Trabajo Presentado</h2>
          <button className="atm-close" onClick={onClose}><X size={24} /></button>
        </div>

        {alert && (
          <Alert 
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {loadingData && (
          <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
            Cargando datos...
          </div>
        )}

        <form className="atm-form" onSubmit={handleSubmit}>
          <div className="atm-form-group">
            <label htmlFor="tituloTrabajo">Título del Trabajo</label>
            <input 
              id="tituloTrabajo" 
              name="tituloTrabajo" 
              value={formData.tituloTrabajo} 
              onChange={handleChange} 
              className={errors.tituloTrabajo ? 'error' : ''} 
            />
            {errors.tituloTrabajo && <div className="atm-error">{errors.tituloTrabajo}</div>}
          </div>

          <div className="atm-form-group">
            <label htmlFor="ciudad">Ciudad</label>
            <input 
              id="ciudad" 
              name="ciudad" 
              value={formData.ciudad} 
              onChange={handleChange} 
              className={errors.ciudad ? 'error' : ''} 
            />
            {errors.ciudad && <div className="atm-error">{errors.ciudad}</div>}
          </div>

          <div className="atm-form-group">
            <label htmlFor="fechaInicio">Fecha de Inicio</label>
            <input 
              type="date" 
              id="fechaInicio" 
              name="fechaInicio" 
              value={formData.fechaInicio} 
              onChange={handleChange} 
              className={errors.fechaInicio ? 'error' : ''} 
            />
            {errors.fechaInicio && <div className="atm-error">{errors.fechaInicio}</div>}
          </div>

          <div className="atm-form-group">
            <label htmlFor="nombreReunion">Nombre de la Reunión</label>
            <input 
              id="nombreReunion" 
              name="nombreReunion" 
              value={formData.nombreReunion} 
              onChange={handleChange} 
            />
          </div>

          <div className="atm-form-group">
            <label htmlFor="GrupoInvestigacion">Grupo de Investigación</label>
            <select 
              id="GrupoInvestigacion" 
              name="GrupoInvestigacion" 
              value={formData.GrupoInvestigacion || ''} 
              onChange={handleChange} 
              className={errors.GrupoInvestigacion ? 'error' : ''}
            >
              <option value="">-- Seleccione grupo --</option>
              {grupos.map(g => {
                const pk = g.oidGrupoInvestigacion ?? g.id;
                return <option key={pk} value={pk}>{g.nombre ?? `#${pk}`}</option>;
              })}
            </select>
            {errors.GrupoInvestigacion && <div className="atm-error">{errors.GrupoInvestigacion}</div>}
          </div>

          <div className="atm-buttons">
            <button type="button" className="atm-btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="atm-btn-submit" disabled={loading}>
              {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
