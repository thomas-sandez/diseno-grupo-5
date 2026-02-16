import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Alert from './Alert';
import './AgregarRegistroModal.css';
import { crearRegistro, listarPatentes, listarTipoRegistros } from '../services/api';

export default function AgregarRegistroModal({ isOpen, onClose, onRegistroCreado }) {
  const [formData, setFormData] = useState({
    descripcion: '',
    TipoDeRegistro: '',
    Patente: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [patentes, setPatentes] = useState([]);
  const [tipoRegistros, setTipoRegistros] = useState([]);

  useEffect(() => {
    if (!isOpen) return; // Solo cargar cuando el modal está abierto
    
    // Limpiar alertas y errores al abrir el modal
    setAlert(null);
    setErrors({});
    
    let mounted = true;
    console.log('Cargando datos del modal...');
    
    listarPatentes()
      .then(data => {
        if (!mounted) return;
        console.log('Patentes recibidas:', data);
        setPatentes(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error al cargar patentes:', err);
        setPatentes([]);
      });

    listarTipoRegistros()
      .then(data => {
        if (!mounted) return;
        console.log('Tipos de registro recibidos:', data);
        setTipoRegistros(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error al cargar tipos de registro:', err);
        setTipoRegistros([]);
      });

    return () => { mounted = false };
  }, [isOpen]);

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

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.Patente) {
      newErrors.Patente = 'Seleccione una patente';
    }

    if (!formData.TipoDeRegistro) {
      newErrors.TipoDeRegistro = 'Seleccione un tipo de registro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      setAlert({
        type: 'warning',
        message: 'Por favor completa todos los campos requeridos correctamente.'
      });
      return;
    }

    setLoading(true);
    try {
      // Build payload matching backend model: { descripcion, TipoDeRegistro, Patente }
      const payload = {
        descripcion: formData.descripcion,
        TipoDeRegistro: parseInt(formData.TipoDeRegistro, 10),
        Patente: parseInt(formData.Patente, 10)
      };

      console.log('Payload a enviar:', payload);
      console.log('FormData:', formData);
      console.log('Patentes disponibles:', patentes);

      const created = await crearRegistro(payload);

      // API uses model fields; primary key may be `oidRegistro` or `id`
      const createdId = created?.oidRegistro ?? created?.id;
      if (!created || createdId === undefined) {
        setAlert({
          type: 'error',
          message: 'No se pudo crear el registro'
        });
      } else {
        // Map backend object to UI-friendly shape expected by parent
        // Resolve display names for tipo and patente if possible
        const tipoId = created?.TipoDeRegistro ?? created?.TipoDeRegistro ?? null;
        const tipoObj = tipoRegistros.find(t => (t.id === tipoId) || (t.oidTipoDeRegistro === tipoId));
        const patenteId = created?.Patente ?? created?.Patente ?? null;
        const patenteObj = patentes.find(p => (p.id === patenteId) || (p.oidPatente === patenteId));

        const uiRegistro = {
          id: createdId,
          nombre: created.descripcion || '',
          tipo: tipoObj ? (tipoObj.nombre || tipoObj.tipo || '') : (created.tipoRegistro || ''),
          fecha: new Date().toISOString().slice(0, 10),
          raw: created
        };

        onRegistroCreado && onRegistroCreado(uiRegistro);
        setFormData({
          descripcion: '',
          TipoDeRegistro: '',
          Patente: ''
        });
        setAlert({
          type: 'success',
          message: '¡Registro creado exitosamente!'
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      // Try to parse backend validation errors if present
      let msg = err.message || 'Error al crear registro';
      try {
        const parsed = JSON.parse(msg);
        // parsed could be object of field->list or {detail: '...'}
        if (parsed.detail) {
          msg = parsed.detail;
        } else if (typeof parsed === 'object') {
          const parts = [];
          for (const [k, v] of Object.entries(parsed)) {
            if (Array.isArray(v)) parts.push(`${k}: ${v.join(', ')}`);
            else parts.push(`${k}: ${v}`);
          }
          msg = parts.join(' | ');
        }
      } catch (e) {
        // not JSON, keep original message
      }
      setAlert({
        type: 'error',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="arm-overlay">
      <div className="arm-modal">
        <div className="arm-header">
          <h2>Agregar Registro de Propiedad</h2>
          <button className="arm-close" onClick={onClose}>
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

        <form onSubmit={handleSubmit} className="arm-form">
          <div className="arm-form-group">
            <label htmlFor="TipoDeRegistro">Tipo de Registro</label>
            <select
              id="TipoDeRegistro"
              name="TipoDeRegistro"
              value={formData.TipoDeRegistro}
              onChange={handleChange}
              className={errors.TipoDeRegistro ? 'error' : ''}
            >
              <option value="">-- Seleccione --</option>
              {tipoRegistros.map(t => {
                const pk = t.oidTipoDeRegistro ?? t.id;
                return <option key={pk} value={pk}>{t.nombre ?? t.tipo ?? `#${pk}`}</option>;
              })}
            </select>
            {errors.TipoDeRegistro && <span className="arm-error">{errors.TipoDeRegistro}</span>}
          </div>

          <div className="arm-form-group">
            <label htmlFor="Patente">Patente asociada</label>
            <select
              id="Patente"
              name="Patente"
              value={formData.Patente}
              onChange={handleChange}
              className={errors.Patente ? 'error' : ''}
            >
              <option value="">-- Seleccione --</option>
              {patentes.map(p => {
                const pk = p.oidPatente ?? p.id;
                // Mostrar el número de la patente como etiqueta de selección; usar descripción como fallback
                return <option key={pk} value={pk}>{p.numero ?? p.descripcion ?? `#${pk}`}</option>;
              })}
            </select>
            {errors.Patente && <span className="arm-error">{errors.Patente}</span>}
          </div>

          <div className="arm-form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles adicionales sobre el registro"
              rows="4"
            />
            {errors.descripcion && <span className="arm-error">{errors.descripcion}</span>}
          </div>

          <div className="arm-buttons">
            <button type="button" className="arm-btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="arm-btn-submit" disabled={loading}>
              {loading ? 'Creando...' : 'Agregar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
