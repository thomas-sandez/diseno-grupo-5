import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './AgregarTrabajoRealizado.css';
import { crearTrabajoPublicado, listarGrupos, listarAutores, listarTiposTrabajoPublicado, crearAutor, isAuthenticated } from '../services/api';

export default function AgregarTrabajoRealizado({ isOpen, onClose, onAdd }) {
  // Fields match backend model TrabajoPublicado: autor, titulo, tipoTrabajoPublicado, GrupoInvestigacion
  const [formData, setFormData] = useState({
    titulo: '',
    ISSN: '',
    editorial: '',
    nombreRevista: '',
    pais: '',
    tipoTrabajoPublicado: '',
    Autor: '',
    GrupoInvestigacion: ''
  });
  const [grupos, setGrupos] = useState([]);
  const [autores, setAutores] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [showNewAuthor, setShowNewAuthor] = useState(false);
  const [newAuthor, setNewAuthor] = useState({ nombre: '', apellido: '' });
  const [creatingAuthor, setCreatingAuthor] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let mounted = true;
    // Only fetch protected lists if the user appears authenticated. If the token is missing
    // or expired we'll avoid triggering background 401s that force a logout.
    if (!isAuthenticated()) {
      setGrupos([]);
      setAutores([]);
      setTipos([]);
      return () => { mounted = false };
    }

    if (!isOpen) return () => { mounted = false };

    console.log('Cargando datos del modal...');
    setLoadingData(true);
    Promise.all([listarGrupos(), listarAutores(), listarTiposTrabajoPublicado()])
      .then(([gr, au, tp]) => {
        if (!mounted) return;
        console.log('Grupos recibidos:', gr);
        console.log('Autores recibidos:', au);
        console.log('Tipos recibidos:', tp);
        setGrupos(Array.isArray(gr) ? gr : []);
        setAutores(Array.isArray(au) ? au : []);
        setTipos(Array.isArray(tp) ? tp : []);
      })
      .catch((err) => { 
        if (!mounted) return; 
        console.error('Error cargando listas:', err);
        setGrupos([]); 
        setAutores([]); 
        setTipos([]); 
      })
      .finally(() => {
        if (mounted) setLoadingData(false);
      });
    return () => { mounted = false };
  }, [isOpen]); // Recargar cuando se abre el modal

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.Autor) newErrors.Autor = 'Seleccione un autor';
    if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido';
    if (!formData.GrupoInvestigacion) newErrors.GrupoInvestigacion = 'Seleccione un grupo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');

    // Map UI fields to backend TrabajoPublicado fields (use model field names)
    const payload = {
      titulo: formData.titulo,
      ISSN: formData.ISSN || '',
      editorial: formData.editorial || '',
      nombreRevista: formData.nombreRevista || '',
      pais: formData.pais || '',
      // backend will set default estado to "Realizado"; do not send estado from UI
      tipoTrabajoPublicado: parseInt(formData.tipoTrabajoPublicado, 10) || null,
      Autor: parseInt(formData.Autor, 10),
      GrupoInvestigacion: parseInt(formData.GrupoInvestigacion, 10)
    };

    crearTrabajoPublicado(payload)
      .then(created => {
        const id = created?.oidTrabajoPublicado ?? created?.id ?? Date.now();
        const tipoObj = tipos.find(t => (t.oidTipoTrabajoPublicado ?? t.id) === (parseInt(formData.tipoTrabajoPublicado, 10) || null));
        const autorObj = autores.find(a => (a.oidAutor ?? a.id) === parseInt(formData.Autor, 10));
        const uiItem = {
          id,
          autor: autorObj ? `${autorObj.nombre} ${autorObj.apellido}` : '',
          titulo: formData.titulo,
          tipoTrabajoPublicado: tipoObj ? (tipoObj.nombre || '') : '',
          raw: created
        };
        if (onAdd) onAdd(uiItem);
        // close modal after successful creation (parent may also choose to close)
        onClose && onClose();
        setFormData({ titulo: '', ISSN: '', editorial: '', nombreRevista: '', pais: '', tipoTrabajoPublicado: '', Autor: '', GrupoInvestigacion: '' });
      })
      .catch(err => {
        let msg = err.message || 'Error al crear trabajo';
        try {
          const parsed = JSON.parse(msg);
          if (parsed.detail) msg = parsed.detail;
          else if (typeof parsed === 'object') msg = Object.entries(parsed).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
        } catch (e) {}
        setSubmitError(msg);
      })
      .finally(() => setLoading(false));
  };

  const handleNewAuthorChange = (e) => {
    const { name, value } = e.target;
    setNewAuthor(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAuthor = () => {
    // create a simple author with nombre & apellido
    if (!newAuthor.nombre.trim() && !newAuthor.apellido.trim()) {
      console.warn('No se puede crear autor sin nombre ni apellido');
      return;
    }
    setCreatingAuthor(true);
    setSubmitError('');
    
    const autorData = { 
      nombre: newAuthor.nombre.trim(), 
      apellido: newAuthor.apellido.trim() 
    };
    
    console.log('Creando autor con datos:', autorData);
    
    crearAutor(autorData)
      .then(created => {
        console.log('Autor creado exitosamente:', created);
        const id = created?.oidAutor ?? created?.id;
        const newA = created || { oidAutor: id, nombre: newAuthor.nombre.trim(), apellido: newAuthor.apellido.trim() };
        setAutores(prev => {
          const updated = [...prev, newA];
          console.log('Lista de autores actualizada:', updated);
          return updated;
        });
        setFormData(prev => ({ ...prev, Autor: id }));
        setNewAuthor({ nombre: '', apellido: '' });
        setShowNewAuthor(false);
      })
      .catch(err => {
        // show error inline
        console.error('Error al crear autor:', err);
        let msg = err.message || 'Error al crear autor';
        try { const parsed = JSON.parse(msg); if (parsed.detail) msg = parsed.detail; } catch(e){}
        setSubmitError(msg);
      })
      .finally(() => setCreatingAuthor(false));
  };

  if (!isOpen) return null;

  return (
    <div className="atr-overlay">
      <div className="atr-modal">
        <div className="atr-header">
          <h2>Agregar Trabajo Realizado</h2>
          <button className="atr-close" onClick={onClose}><X size={24} /></button>
        </div>

        {loadingData && (
          <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
            Cargando datos...
          </div>
        )}

        <form className="atr-form" onSubmit={handleSubmit}>
          <div className="atr-form-group">
            <label htmlFor="Autor">Autor</label>
            <select id="Autor" name="Autor" value={formData.Autor || ''} onChange={handleChange} className={errors.Autor ? 'error' : ''}>
              <option value="">-- Seleccione autor ({autores.length} disponibles) --</option>
              {autores.map(a => {
                const pk = a.oidAutor ?? a.id;
                return <option key={pk} value={pk}>{`${a.nombre} ${a.apellido}`}</option>;
              })}
            </select>
            {errors.Autor && <div className="atr-error">{errors.Autor}</div>}
            <div className="atr-author-actions">
              {!showNewAuthor ? (
                <button type="button" className="atr-btn-add" onClick={() => { setShowNewAuthor(true); setSubmitError(''); }}>
                  Agregar autor
                </button>
              ) : (
                <button type="button" className="atr-btn-cancel-mini" onClick={() => { setShowNewAuthor(false); setNewAuthor({ nombre: '', apellido: '' }); setSubmitError(''); }}>
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {showNewAuthor && (
            <div className="atr-form-group">
              <label aria-hidden="true">&nbsp;</label>
              <div className="atr-new-author">
                <input className="atr-input" name="nombre" placeholder="Nombre" value={newAuthor.nombre} onChange={handleNewAuthorChange} />
                <input className="atr-input" name="apellido" placeholder="Apellido" value={newAuthor.apellido} onChange={handleNewAuthorChange} />
                <button type="button" onClick={handleCreateAuthor} disabled={creatingAuthor} className="atr-btn-primary atr-btn-small">{creatingAuthor ? 'Creando...' : 'Agregar'}</button>
              </div>
            </div>
          )}

          <div className="atr-form-group">
            <label htmlFor="titulo">Título del Trabajo</label>
            <input id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} className={errors.titulo ? 'error' : ''} />
            {errors.titulo && <div className="atr-error">{errors.titulo}</div>}
          </div>

          <div className="atr-form-group">
            <label htmlFor="ISSN">ISSN</label>
            <input id="ISSN" name="ISSN" value={formData.ISSN} onChange={handleChange} />
          </div>

          <div className="atr-form-group">
            <label htmlFor="editorial">Editorial</label>
            <input id="editorial" name="editorial" value={formData.editorial} onChange={handleChange} />
          </div>

          <div className="atr-form-group">
            <label htmlFor="nombreRevista">Nombre Revista</label>
            <input id="nombreRevista" name="nombreRevista" value={formData.nombreRevista} onChange={handleChange} />
          </div>

          <div className="atr-form-group">
            <label htmlFor="pais">País</label>
            <input id="pais" name="pais" value={formData.pais} onChange={handleChange} />
          </div>

          {/* Estado must be managed by backend and default to "Realizado"; hidden from users */}

          <div className="atr-form-group">
            <label htmlFor="tipoTrabajoPublicado">Tipo de Trabajo</label>
            <select id="tipoTrabajoPublicado" name="tipoTrabajoPublicado" value={formData.tipoTrabajoPublicado || ''} onChange={handleChange}>
              <option value="">-- Seleccione tipo ({tipos.length} disponibles) --</option>
              {tipos.map(t => {
                const pk = t.oidTipoTrabajoPublicado ?? t.id;
                return <option key={pk} value={pk}>{t.nombre ?? `#${pk}`}</option>;
              })}
            </select>
          </div>

          

          <div className="atr-form-group">
            <label htmlFor="GrupoInvestigacion">Grupo de Investigación</label>
            <select id="GrupoInvestigacion" name="GrupoInvestigacion" value={formData.GrupoInvestigacion || ''} onChange={handleChange} className={errors.GrupoInvestigacion ? 'error' : ''}>
              <option value="">-- Seleccione grupo ({grupos.length} disponibles) --</option>
              {grupos.map(g => {
                const pk = g.oidGrupoInvestigacion ?? g.id;
                return <option key={pk} value={pk}>{g.nombre ?? `#${pk}`}</option>;
              })}
            </select>
            {errors.GrupoInvestigacion && <div className="atr-error">{errors.GrupoInvestigacion}</div>}
          </div>

          {submitError && <div className="atr-submit-error">{submitError}</div>}

          <div className="atr-buttons">
            <button type="button" className="atr-btn-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="atr-btn-submit" disabled={loading}>{loading ? 'Creando...' : 'Agregar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
