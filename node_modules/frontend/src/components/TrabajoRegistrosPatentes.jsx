import React, { useState, useEffect } from 'react';
import './TrabajoRegistrosPatentes.css';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import AgregarRegistroModal from './AgregarRegistroModal';
import AgregarPatenteModal from './AgregarPatenteModal';
import AgregarTrabajoModal from './AgregarTrabajoModal';
import EditarTrabajoPresentadoModal from './EditarTrabajoPresentadoModal';
import EditarRegistroModal from './EditarRegistroModal';
import EditarPatenteModal from './EditarPatenteModal';
import ConfirmModal from './ConfirmModal';
import Alert from './Alert';
import { 
  listarRegistros, 
  listarPatentes, 
  listarTipoRegistros, 
  listarTrabajosPresentados,
  eliminarTrabajoPresentado,
  eliminarRegistro,
  eliminarPatente
} from '../services/api';

const TrabajoRegistrosPatentes = () => {
  // Estados para modales
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [showPatenteModal, setShowPatenteModal] = useState(false);
  const [showTrabajoModal, setShowTrabajoModal] = useState(false);
  
  // Estados para modales de edición
  const [showEditTrabajoModal, setShowEditTrabajoModal] = useState(false);
  const [showEditRegistroModal, setShowEditRegistroModal] = useState(false);
  const [showEditPatenteModal, setShowEditPatenteModal] = useState(false);
  
  // Estados para elementos seleccionados
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [selectedPatente, setSelectedPatente] = useState(null);
  
  // Estados para confirm modal y alert
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null, type: null });
  const [alert, setAlert] = useState(null);
  
  // Estados para búsqueda y filtros
  const [trabajoSearch, setTrabajoSearch] = useState('');
  const [registroSearch, setRegistroSearch] = useState('');
  const [patenteSearch, setPatenteSearch] = useState('');
  
  const [registroTipo, setRegistroTipo] = useState('');
  const [patenteTipo, setPatenteTipo] = useState('');

  // Trabajos cargados desde backend
  const [trabajos, setTrabajos] = useState([]);

  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    let mounted = true;
    // load trabajos, registros, patentes and tipo registros from backend
    recargarDatos();
    return () => { mounted = false };
  }, []);

  const [patentes, setPatentes] = useState([]);
  const [tipoRegistros, setTipoRegistros] = useState([]);

  // Función para recargar todos los datos
  const recargarDatos = () => {
    Promise.all([listarTrabajosPresentados(), listarRegistros(), listarPatentes(), listarTipoRegistros()])
      .then(([trabajosData, registrosData, patentesData, tiposData]) => {
        const trabajosArrRaw = Array.isArray(trabajosData) ? trabajosData : [];
        const patentesArrRaw = Array.isArray(patentesData) ? patentesData : [];
        const tiposArr = Array.isArray(tiposData) ? tiposData : [];

        // Función para formatear fecha al estilo argentino (DD/MM/AAAA)
        const formatearFecha = (fechaISO) => {
          if (!fechaISO) return '';
          const fecha = new Date(fechaISO);
          const dia = String(fecha.getDate()).padStart(2, '0');
          const mes = String(fecha.getMonth() + 1).padStart(2, '0');
          const anio = fecha.getFullYear();
          return `${dia}/${mes}/${anio}`;
        };

        const trabajosMapped = trabajosArrRaw.map(t => ({
          id: t?.oidTrabajoPresentado ?? t?.id,
          ciudad: t?.ciudad ?? '',
          fechaInicio: formatearFecha(t?.fechaInicio),
          nombreReunion: t?.nombreReunion ?? '',
          tituloTrabajo: t?.tituloTrabajo ?? '',
          raw: t
        }));

        const patentesArr = patentesArrRaw.map(p => ({
          id: p?.oidPatente ?? p?.id,
          numero: p?.numero ?? p?.descripcion ?? '',
          descripcion: p?.descripcion ?? '',
          tipo: p?.tipo ?? '',
          fecha: p?.fecha ?? '',
          raw: p
        }));

        const records = Array.isArray(registrosData) ? registrosData.map(r => {
          const id = r?.oidRegistro ?? r?.id;
          const nombre = r?.descripcion ?? '';
          const tipoId = r?.TipoDeRegistro ?? r?.tipoRegistro ?? null;
          const tipoObj = tiposArr.find(t => (t.oidTipoDeRegistro === tipoId) || (t.id === tipoId));
          const tipo = tipoObj ? (tipoObj.nombre || '') : (r?.tipoRegistro || '');
          const patenteId = r?.Patente ?? null;
          const patenteObj = patentesArr.find(p => (p.oidPatente === patenteId) || (p.id === patenteId));
          const fecha = r?.fecha ?? (patenteObj?.fecha ?? '');

          return { id, nombre, tipo, fecha, raw: r };
        }) : [];

        setTrabajos(trabajosMapped);
        setPatentes(patentesArr);
        setTipoRegistros(tiposArr);
        setRegistros(records);
      })
      .catch(() => {
        setRegistros([]);
        setPatentes([]);
        setTipoRegistros([]);
        setTrabajos([]);
      });
  };

  // Filtrar datos
  const trabajosFiltrados = trabajos.filter(t =>
    (String(t.ciudad || '').toLowerCase().includes(String(trabajoSearch || '').toLowerCase())) ||
    (String(t.tituloTrabajo || '').toLowerCase().includes(String(trabajoSearch || '').toLowerCase()))
  );

  const registrosFiltrados = registros.filter(r =>
    (registroTipo === '' || r.tipo === registroTipo) &&
    (String(r.nombre || '').toLowerCase().includes(String(registroSearch || '').toLowerCase()))
  );

  const patentesFiltradas = patentes.filter(p =>
    (patenteTipo === '' || p.tipo === patenteTipo) &&
    (String(p.descripcion || '').toLowerCase().includes(String(patenteSearch || '').toLowerCase()))
  );

  // Opciones para dropdowns
  const tiposRegistro = ['Patente Nacional', 'Patente Internacional', 'Registro Marcario'];
  const tiposPatente = ['Patente Activa', 'Patente en Trámite', 'Patente Expirada'];

  // Handlers para agregar registro y patente
  const handleRegistroCreado = (nuevoRegistro) => {
    setRegistros(prev => [...prev, nuevoRegistro]);
    setShowRegistroModal(false);
  };

  const handleAddPatente = (nuevaPatente) => {
    setPatentes(prev => [...prev, nuevaPatente]);
    setShowPatenteModal(false);
  };

  const handleAddTrabajo = (nuevoTrabajo) => {
    setTrabajos(prev => [...prev, nuevoTrabajo]);
    setShowTrabajoModal(false);
  };

  const handleEditTrabajo = (trabajo) => {
    setSelectedTrabajo(trabajo.raw || trabajo);
    setShowEditTrabajoModal(true);
  };

  const handleDeleteTrabajo = (trabajo) => {
    setConfirmModal({ isOpen: true, item: trabajo, type: 'trabajo' });
  };

  const confirmDeleteTrabajo = async () => {
    const trabajo = confirmModal.item;
    setConfirmModal({ isOpen: false, item: null, type: null });

    try {
      await eliminarTrabajoPresentado(trabajo.id);
      console.log('Trabajo eliminado exitosamente');
      setAlert({ type: 'success', message: 'Trabajo eliminado exitosamente' });
      recargarDatos();
    } catch (err) {
      console.error('Error al eliminar trabajo:', err);
      setAlert({ type: 'error', message: 'Error al eliminar el trabajo' });
    }
  };

  const handleEditRegistro = (registro) => {
    setSelectedRegistro(registro.raw || registro);
    setShowEditRegistroModal(true);
  };

  const handleDeleteRegistro = (registro) => {
    setConfirmModal({ isOpen: true, item: registro, type: 'registro' });
  };

  const confirmDeleteRegistro = async () => {
    const registro = confirmModal.item;
    setConfirmModal({ isOpen: false, item: null, type: null });

    try {
      await eliminarRegistro(registro.id);
      console.log('Registro eliminado exitosamente');
      setAlert({ type: 'success', message: 'Registro eliminado exitosamente' });
      recargarDatos();
    } catch (err) {
      console.error('Error al eliminar registro:', err);
      setAlert({ type: 'error', message: 'Error al eliminar el registro' });
    }
  };

  const handleEditPatente = (patente) => {
    setSelectedPatente(patente.raw || patente);
    setShowEditPatenteModal(true);
  };

  const handleDeletePatente = (patente) => {
    setConfirmModal({ isOpen: true, item: patente, type: 'patente' });
  };

  const confirmDeletePatente = async () => {
    const patente = confirmModal.item;
    setConfirmModal({ isOpen: false, item: null, type: null });

    try {
      await eliminarPatente(patente.id);
      console.log('Patente eliminada exitosamente');
      setAlert({ type: 'success', message: 'Patente eliminada exitosamente' });
      recargarDatos();
    } catch (err) {
      console.error('Error al eliminar patente:', err);
      setAlert({ type: 'error', message: 'Error al eliminar la patente' });
    }
  };

  const handleConfirm = () => {
    if (confirmModal.type === 'trabajo') {
      confirmDeleteTrabajo();
    } else if (confirmModal.type === 'registro') {
      confirmDeleteRegistro();
    } else if (confirmModal.type === 'patente') {
      confirmDeletePatente();
    }
  };

  const getConfirmMessage = () => {
    if (confirmModal.type === 'trabajo') {
      return `¿Está seguro que desea eliminar el trabajo "${confirmModal.item?.tituloTrabajo}"? Esta acción no se puede deshacer.`;
    } else if (confirmModal.type === 'registro') {
      return `¿Está seguro que desea eliminar el registro "${confirmModal.item?.nombre}"? Esta acción no se puede deshacer.`;
    } else if (confirmModal.type === 'patente') {
      return `¿Está seguro que desea eliminar la patente "${confirmModal.item?.numero}"? Esta acción no se puede deshacer.`;
    }
    return '';
  };

  return (
    <div className="trp-container">
      {alert && (
        <Alert 
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={`Eliminar ${confirmModal.type === 'trabajo' ? 'Trabajo' : confirmModal.type === 'registro' ? 'Registro' : 'Patente'}`}
        message={getConfirmMessage()}
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, item: null, type: null })}
      />

      {/* Sección de Trabajos */}
      <section className="trp-section">
        <div className="trp-header">
          <h2>Trabajos</h2>
          <div className="trp-search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar trabajo"
              value={trabajoSearch}
              onChange={(e) => setTrabajoSearch(e.target.value)}
              className="trp-input"
            />
              <button className="trp-btn-add" title="Agregar trabajo" onClick={() => setShowTrabajoModal(true)}>
                <Plus size={20} />
              </button>
          </div>
        </div>

        <table className="trp-table">
          <thead>
            <tr>
              <th>Ciudad</th>
              <th>Fecha Inicio</th>
              <th>Nombre de la Reunión</th>
              <th>Título Trabajo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trabajosFiltrados.length > 0 ? (
              trabajosFiltrados.map(trabajo => (
                <tr key={trabajo.id}>
                  <td>{trabajo.ciudad}</td>
                  <td>{trabajo.fechaInicio}</td>
                  <td>{trabajo.nombreReunion}</td>
                  <td>{trabajo.tituloTrabajo}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEditTrabajo(trabajo)}
                        className="action-button edit-button"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrabajo(trabajo)}
                        className="action-button delete-button"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="trp-empty">No hay trabajos</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="trp-row">
        {/* Sección de Registros */}
        <section className="trp-section trp-section-half">
          <div className="trp-header">
            <h3>Registro de Propiedad</h3>
            <div className="trp-search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar registro"
                value={registroSearch}
                onChange={(e) => setRegistroSearch(e.target.value)}
                className="trp-input"
              />
              <button className="trp-btn-add" title="Agregar registro" onClick={() => setShowRegistroModal(true)}>
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="trp-filter">
            <select
              value={registroTipo}
              onChange={(e) => setRegistroTipo(e.target.value)}
              className="trp-select"
            >
              <option value="">tipo</option>
              {tiposRegistro.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div className="trp-items-list">
            {registrosFiltrados.length > 0 ? (
              registrosFiltrados.map(registro => (
                <div key={registro.id} className="trp-item">
                  <div className="trp-item-info">
                    <strong>{registro.nombre}</strong>
                    <small>{registro.tipo} • {registro.fecha}</small>
                  </div>
                  <div className="trp-item-actions">
                    <button
                      onClick={() => handleEditRegistro(registro)}
                      className="action-button edit-button"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteRegistro(registro)}
                      className="action-button delete-button"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="trp-empty">No hay registros</div>
            )}
          </div>
        </section>

        {/* Sección de Patentes */}
        <section className="trp-section trp-section-half">
          <div className="trp-header">
            <h3>Patentes</h3>
            <div className="trp-search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar patente"
                value={patenteSearch}
                onChange={(e) => setPatenteSearch(e.target.value)}
                className="trp-input"
              />
              <button className="trp-btn-add" title="Agregar patente" onClick={() => setShowPatenteModal(true)}>
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="trp-filter">
            <select
              value={patenteTipo}
              onChange={(e) => setPatenteTipo(e.target.value)}
              className="trp-select"
            >
              <option value="">tipo</option>
              {tiposPatente.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div className="trp-items-list">
            {patentesFiltradas.length > 0 ? (
              patentesFiltradas.map(patente => (
                <div key={patente.id} className="trp-item">
                  <div className="trp-item-info">
                    <strong>{patente.numero}</strong>
                    <small>{patente.tipo} • {patente.fecha}</small>
                  </div>
                  <div className="trp-item-actions">
                    <button
                      onClick={() => handleEditPatente(patente)}
                      className="action-button edit-button"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeletePatente(patente)}
                      className="action-button delete-button"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="trp-empty">No hay patentes</div>
            )}
          </div>
        </section>
      </div>

      <AgregarRegistroModal 
        isOpen={showRegistroModal}
        onClose={() => setShowRegistroModal(false)}
        onRegistroCreado={handleRegistroCreado}
      />

      <AgregarPatenteModal 
        isOpen={showPatenteModal}
        onClose={() => setShowPatenteModal(false)}
        onAdd={handleAddPatente}
      />
      
      <AgregarTrabajoModal
        isOpen={showTrabajoModal}
        onClose={() => setShowTrabajoModal(false)}
        onAdd={handleAddTrabajo}
      />

      <EditarTrabajoPresentadoModal
        isOpen={showEditTrabajoModal}
        onClose={() => setShowEditTrabajoModal(false)}
        onUpdate={() => {
          recargarDatos();
          setShowEditTrabajoModal(false);
        }}
        trabajo={selectedTrabajo}
      />

      <EditarRegistroModal
        isOpen={showEditRegistroModal}
        onClose={() => setShowEditRegistroModal(false)}
        onUpdate={() => {
          recargarDatos();
          setShowEditRegistroModal(false);
        }}
        registro={selectedRegistro}
      />

      <EditarPatenteModal
        isOpen={showEditPatenteModal}
        onClose={() => setShowEditPatenteModal(false)}
        onUpdate={() => {
          recargarDatos();
          setShowEditPatenteModal(false);
        }}
        patente={selectedPatente}
      />
    </div>
  );
};

export default TrabajoRegistrosPatentes;
