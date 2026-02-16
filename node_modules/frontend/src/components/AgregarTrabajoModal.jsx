import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Alert from './Alert';
import './AgregarTrabajoModal.css';
import { crearTrabajoPresentado, listarGrupos } from '../services/api';

export default function AgregarTrabajoModal({ isOpen, onClose, onAdd }) {
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
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    let mounted = true;
    listarGrupos()
      .then(data => { if (!mounted) return; setGrupos(Array.isArray(data) ? data : []); })
      .catch(() => { if (!mounted) return; setGrupos([]); });
    return () => { mounted = false };
  }, []);

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
      setAlert({
        type: 'warning',
        message: 'Por favor completa todos los campos requeridos correctamente.'
      });
      return;
    }
    setLoading(true);

    const payload = {
      ciudad: formData.ciudad,
      fechaInicio: formData.fechaInicio, // expect ISO datetime
      nombreReunion: formData.nombreReunion,
      tituloTrabajo: formData.tituloTrabajo,
      GrupoInvestigacion: parseInt(formData.GrupoInvestigacion, 10)
    };

    crearTrabajoPresentado(payload)
      .then(created => {
        const id = created?.oidTrabajoPresentado ?? created?.id ?? Date.now();
        const uiTrabajo = {
          id,
          ciudad: created?.ciudad ?? payload.ciudad,
          fechaInicio: created?.fechaInicio ?? payload.fechaInicio,
          nombreReunion: created?.nombreReunion ?? payload.nombreReunion,
          tituloTrabajo: created?.tituloTrabajo ?? payload.tituloTrabajo,
          raw: created
        };
        onAdd && onAdd(uiTrabajo);
        setFormData({ ciudad: '', fechaInicio: '', nombreReunion: '', tituloTrabajo: '', GrupoInvestigacion: '' });
        setAlert({
          type: 'success',
          message: '¡Trabajo creado exitosamente!'
        });
        setTimeout(() => onClose(), 1500);
      })
      .catch(err => {
        let msg = err.message || 'Error al crear trabajo';
        try {
          const parsed = JSON.parse(msg);
          if (parsed.detail) msg = parsed.detail;
          else if (typeof parsed === 'object') msg = Object.entries(parsed).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
        } catch (e) {}
        setAlert({
          type: 'error',
          message: msg
        });
      })
      .finally(() => setLoading(false));
  };

  if (!isOpen) return null;

  return (
    <div className="atm-overlay">
      <div className="atm-modal">
        <div className="atm-header">
          <h2>Agregar Trabajo Presentado</h2>
          <button className="atm-close" onClick={onClose}><X size={24} /></button>
        </div>

        {alert && (
          <Alert 
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={alert.type === 'success'}
          />
        )}

        <form className="atm-form" onSubmit={handleSubmit}>
          <div className="atm-form-group">
            <label htmlFor="tituloTrabajo">Título del Trabajo</label>
            <input id="tituloTrabajo" name="tituloTrabajo" value={formData.tituloTrabajo} onChange={handleChange} className={errors.tituloTrabajo ? 'error' : ''} />
            {errors.tituloTrabajo && <div className="atm-error">{errors.tituloTrabajo}</div>}
          </div>

          <div className="atm-form-group">
            <label htmlFor="fechaInicio">Fecha de inicio</label>
            <input id="fechaInicio" name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} className={errors.fechaInicio ? 'error' : ''} />
            {errors.fechaInicio && <div className="atm-error">{errors.fechaInicio}</div>}
          </div>

          <div className="atm-form-group">
            <label htmlFor="ciudad">Ciudad</label>
            <input id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} className={errors.ciudad ? 'error' : ''} />
            {errors.ciudad && <div className="atm-error">{errors.ciudad}</div>}
          </div>

          <div className="atm-form-group">
            <label htmlFor="nombreReunion">Nombre de la reunión</label>
            <input id="nombreReunion" name="nombreReunion" value={formData.nombreReunion} onChange={handleChange} />
          </div>

          <div className="atm-form-group">
            <label htmlFor="GrupoInvestigacion">Grupo de Investigación</label>
            <select id="GrupoInvestigacion" name="GrupoInvestigacion" value={formData.GrupoInvestigacion || ''} onChange={handleChange} className={errors.GrupoInvestigacion ? 'error' : ''}>
              <option value="">-- Seleccione --</option>
              {grupos.map(g => {
                const pk = g.oidGrupoInvestigacion ?? g.id;
                return <option key={pk} value={pk}>{g.nombre ?? `#${pk}`}</option>;
              })}
            </select>
            {errors.GrupoInvestigacion && <div className="atm-error">{errors.GrupoInvestigacion}</div>}
          </div>

          <div className="atm-buttons">
            <button type="button" className="atm-btn-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="atm-btn-submit" disabled={loading}>{loading ? 'Creando...' : 'Agregar Trabajo'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
