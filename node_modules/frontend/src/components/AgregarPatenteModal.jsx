import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Alert from './Alert';
import './AgregarPatenteModal.css';
import { crearPatente, listarGrupos } from '../services/api';

export default function AgregarPatenteModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'Patente Activa',
    fecha: '',
    inventor: '',
    descripcion: ''
  });
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [errors, setErrors] = useState({});

  // Limpiar alertas y errores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setAlert(null);
      setErrors({});
    }
  }, [isOpen]);

  const tiposPatente = ['Patente Activa', 'Patente en Trámite', 'Patente Expirada'];

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.numero.trim()) {
      newErrors.numero = 'El número de patente es requerido';
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!formData.inventor.trim()) {
      newErrors.inventor = 'El nombre del inventor es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,-]+$/.test(formData.inventor)) {
      newErrors.inventor = 'Solo se permiten letras, espacios y signos de puntuación básicos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      setAlert({
        type: 'warning',
        message: 'Por favor completa todos los campos requeridos correctamente.'
      });
      return;
    }
    // Build payload for backend including new fields and optional file
    const desc = formData.descripcion && formData.descripcion.trim().length > 0
      ? formData.descripcion
      : `${formData.numero} ${formData.inventor} ${formData.fecha}`;

    const payloadToSend = {
      descripcion: desc,
      tipo: formData.tipo,
      GrupoInvestigacion: parseInt(formData.GrupoInvestigacion, 10),
      numero: formData.numero,
      fecha: formData.fecha || null,
      inventor: formData.inventor
    };

    setLoading(true);
    crearPatente(payloadToSend)
      .then(created => {
        const createdId = created?.oidPatente ?? created?.id ?? Date.now();
        const uiPatente = {
          id: createdId,
          numero: formData.numero,
          tipo: formData.tipo,
          fecha: formData.fecha,
          descripcion: created?.descripcion ?? formData.descripcion,
          raw: created
        };
        onAdd && onAdd(uiPatente);
        setFormData({ numero: '', tipo: 'Patente Activa', fecha: '', inventor: '', descripcion: '' });
        setAlert({
          type: 'success',
          message: '¡Patente creada exitosamente!'
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      })
      .catch(err => {
        let msg = err.message || 'Error al crear patente';
        try {
          const parsed = JSON.parse(msg);
          if (parsed.detail) msg = parsed.detail;
          else if (typeof parsed === 'object') {
            msg = Object.entries(parsed).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
          }
        } catch (e) {}
        setAlert({
          type: 'error',
          message: msg
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let mounted = true;
    listarGrupos()
      .then(data => { if (!mounted) return; setGrupos(Array.isArray(data) ? data : []); })
      .catch(() => { if (!mounted) return; setGrupos([]); });
    return () => { mounted = false };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="apm-overlay">
      <div className="apm-modal">
        <div className="apm-header">
          <h2>Agregar Patente</h2>
          <button className="apm-close" onClick={onClose}>
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

        <form onSubmit={handleSubmit} className="apm-form">
          <div className="apm-form-group">
            <label htmlFor="numero">Número de Patente</label>
            <input
              type="text"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder="Ej: P-2024-001"
              className={errors.numero ? 'error' : ''}
            />
            {errors.numero && <span className="apm-error">{errors.numero}</span>}
          </div>

          <div className="apm-form-group">
            <label htmlFor="tipo">Tipo de Patente</label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
            >
              {tiposPatente.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div className="apm-form-group">
            <label htmlFor="fecha">Fecha de Solicitud</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className={errors.fecha ? 'error' : ''}
            />
            {errors.fecha && <span className="apm-error">{errors.fecha}</span>}
          </div>

          <div className="apm-form-group">
            <label htmlFor="inventor">Inventor/Titular</label>
            <input
              type="text"
              id="inventor"
              name="inventor"
              value={formData.inventor}
              onChange={handleChange}
              placeholder="Nombre del inventor o empresa"
              className={errors.inventor ? 'error' : ''}
            />
            {errors.inventor && <span className="apm-error">{errors.inventor}</span>}
          </div>

          <div className="apm-form-group">
            <label htmlFor="descripcion">Descripción de la Invención</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe brevemente la invención"
              rows="4"
            />
          </div>

          <div className="apm-form-group">
            <label htmlFor="GrupoInvestigacion">Grupo de Investigación</label>
            <select id="GrupoInvestigacion" name="GrupoInvestigacion" value={formData.GrupoInvestigacion || ''} onChange={handleChange}>
              <option value="">-- Seleccione --</option>
              {grupos.map(g => {
                const pk = g.oidGrupoInvestigacion ?? g.id;
                return <option key={pk} value={pk}>{g.nombre ?? `#${pk}`}</option>;
              })}
            </select>
          </div>

          {/* File uploads removed — files are not saved in the backend */}

          <div className="apm-buttons">
            <button type="button" className="apm-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="apm-btn-submit">
              Agregar Patente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
