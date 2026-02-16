import React, { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import './TrabajosList.css';
import AgregarTrabajoRealizado from './AgregarTrabajoRealizado';
import EditarTrabajoModal from './EditarTrabajoModal';
import { listarTrabajosPublicados, eliminarTrabajoPublicado, actualizarTrabajoPublicado } from '../services/api';
import ConfirmModal from './ConfirmModal';
import Alert from './Alert';

function TrabajosList() {
  const [activeTab, setActiveTab] = useState('realizados');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAgregarRealizado, setShowAgregarRealizado] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [trabajoAEditar, setTrabajoAEditar] = useState(null);
  const [trabajosRealizados, setTrabajosRealizados] = useState([]);
  const [trabajosPublicados, setTrabajosPublicados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, trabajo: null, action: null });
  const [alert, setAlert] = useState(null);

  // Cargar trabajos desde el backend
  useEffect(() => {
    loadTrabajos();
  }, []);

  const loadTrabajos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listarTrabajosPublicados();
      if (Array.isArray(data)) {
        // Separar trabajos realizados de publicados según su estado
        const realizados = data.filter(t => t.estado === 'Realizado');
        const publicados = data.filter(t => t.estado === 'Publicado');
        setTrabajosRealizados(realizados);
        setTrabajosPublicados(publicados);
      }
    } catch (err) {
      setError('Error al cargar los trabajos');
      console.error('Error cargando trabajos:', err);
    } finally {
      setLoading(false);
    }
  };

  const trabajos = activeTab === 'realizados' ? trabajosRealizados : trabajosPublicados;

  const filteredTrabajos = trabajos.filter(trabajo =>
    (trabajo.nombreRevista || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trabajo.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trabajo.editorial || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTrabajo = (nuevoTrabajo) => {
    // Recargar la lista después de agregar
    loadTrabajos();
    setShowAgregarRealizado(false);
  };

  const handleEdit = (trabajo) => {
    setTrabajoAEditar(trabajo);
    setShowEditarModal(true);
  };

  const handleUpdate = (trabajoActualizado) => {
    loadTrabajos();
    setShowEditarModal(false);
    setTrabajoAEditar(null);
  };

  const handleDelete = (trabajo) => {
    setConfirmModal({ isOpen: true, trabajo, action: 'delete' });
  };

  const confirmDelete = async () => {
    const trabajo = confirmModal.trabajo;
    setConfirmModal({ isOpen: false, trabajo: null, action: null });

    try {
      const trabajoId = trabajo.oidTrabajoPublicado || trabajo.id;
      await eliminarTrabajoPublicado(trabajoId);
      console.log('Trabajo eliminado exitosamente');
      setAlert({ type: 'success', message: 'Trabajo eliminado exitosamente' });
      loadTrabajos();
    } catch (err) {
      console.error('Error al eliminar trabajo:', err);
      setAlert({ type: 'error', message: 'Error al eliminar el trabajo' });
    }
  };

  const handlePublish = (trabajo) => {
    setConfirmModal({ isOpen: true, trabajo, action: 'publish' });
  };

  const confirmPublish = async () => {
    const trabajo = confirmModal.trabajo;
    setConfirmModal({ isOpen: false, trabajo: null, action: null });

    try {
      const trabajoId = trabajo.oidTrabajoPublicado || trabajo.id;
      const payload = {
        titulo: trabajo.titulo,
        ISSN: trabajo.ISSN || '',
        editorial: trabajo.editorial || '',
        nombreRevista: trabajo.nombreRevista || '',
        pais: trabajo.pais || '',
        estado: 'Publicado', // Cambiar estado a Publicado
        tipoTrabajoPublicado: trabajo.tipoTrabajoPublicado,
        Autor: trabajo.Autor,
        GrupoInvestigacion: trabajo.GrupoInvestigacion
      };
      
      await actualizarTrabajoPublicado(trabajoId, payload);
      console.log('Trabajo publicado exitosamente');
      setAlert({ type: 'success', message: 'Trabajo publicado exitosamente' });
      loadTrabajos();
    } catch (err) {
      console.error('Error al publicar trabajo:', err);
      setAlert({ type: 'error', message: 'Error al publicar el trabajo' });
    }
  };

  const handleConfirm = () => {
    if (confirmModal.action === 'delete') {
      confirmDelete();
    } else if (confirmModal.action === 'publish') {
      confirmPublish();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {alert && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, width: '90%', maxWidth: '500px' }}>
          <Alert 
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.action === 'delete' ? 'Eliminar Trabajo' : 'Publicar Trabajo'}
        message={confirmModal.action === 'delete' 
          ? `¿Está seguro que desea eliminar el trabajo "${confirmModal.trabajo?.titulo}"? Esta acción no se puede deshacer.`
          : `¿Está seguro que desea publicar el trabajo "${confirmModal.trabajo?.titulo}"?`
        }
        type={confirmModal.action === 'delete' ? 'danger' : 'confirm'}
        confirmText={confirmModal.action === 'delete' ? 'Eliminar' : 'Publicar'}
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, trabajo: null, action: null })}
      />

      <div className="trabajos-container">
      <div className="trabajos-header">
        <h2>Trabajos Realizados y Publicados</h2>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Cargando trabajos...</div>}

      <div className="trabajos-tabs">
        <button
          className={`tab-button ${activeTab === 'realizados' ? 'active' : ''}`}
          onClick={() => setActiveTab('realizados')}
        >
          Trabajos Realizados.
        </button>
        <button
          className={`tab-button ${activeTab === 'publicados' ? 'active' : ''}`}
          onClick={() => setActiveTab('publicados')}
        >
          Trabajos Publicados.
        </button>
      </div>

      <div className="trabajos-section">
        <h3>{activeTab === 'realizados' ? 'Trabajos Realizados.' : 'Trabajos Publicados.'}</h3>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar trabajo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            <Search size={18} />
          </button>
          {activeTab === 'realizados' && (
            <button className="add-button" title="Agregar nuevo trabajo" onClick={() => setShowAgregarRealizado(true)}>
              <Plus size={18} />
            </button>
          )}
        </div>

        <div className="table-wrapper">
          <table className="trabajos-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Nombre Revista</th>
                <th>ISSN</th>
                <th>Editorial</th>
                <th>País</th>
                <th>Tipo de Trabajo</th>
                <th>Grupo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrabajos.length > 0 ? (
                filteredTrabajos.map((trabajo) => (
                  <tr key={trabajo.oidTrabajoPublicado || trabajo.id}>
                    <td>{trabajo.titulo || '-'}</td>
                    <td>{trabajo.Autor_detalle ? `${trabajo.Autor_detalle.nombre || ''} ${trabajo.Autor_detalle.apellido || ''}`.trim() : '-'}</td>
                    <td>{trabajo.nombreRevista || '-'}</td>
                    <td>{trabajo.ISSN || '-'}</td>
                    <td>{trabajo.editorial || '-'}</td>
                    <td>{trabajo.pais || '-'}</td>
                    <td>{trabajo.tipoTrabajoPublicado_detalle?.nombre || '-'}</td>
                    <td>{trabajo.GrupoInvestigacion_detalle?.nombre || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(trabajo)}
                          className="action-button edit-button"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(trabajo)}
                          className="action-button delete-button"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                        {activeTab === 'realizados' && (
                          <button
                            onClick={() => handlePublish(trabajo)}
                            className="action-button publish-button"
                            title="Publicar"
                          >
                            Publicar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="empty-message">
                    {loading ? 'Cargando...' : 'No hay trabajos para mostrar'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <AgregarTrabajoRealizado
      isOpen={showAgregarRealizado}
      onClose={() => setShowAgregarRealizado(false)}
      onAdd={handleAddTrabajo}
    />
    <EditarTrabajoModal
      isOpen={showEditarModal}
      onClose={() => {
        setShowEditarModal(false);
        setTrabajoAEditar(null);
      }}
      onUpdate={handleUpdate}
      trabajo={trabajoAEditar}
    />
  </div>
  );
}

export default TrabajosList;
