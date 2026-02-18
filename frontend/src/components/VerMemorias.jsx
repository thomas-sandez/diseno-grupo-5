import React, { useState, useEffect } from 'react';
import { Eye, Download, Trash2, Calendar, Users as UsersIcon, FileText } from 'lucide-react';
import './VerMemorias.css';
import ConfirmModal from './ConfirmModal';
import Alert from './Alert';

const API_BASE_URL = 'http://127.0.0.1:8000';

function VerMemorias() {
  const [memorias, setMemorias] = useState([]);
  const [selectedMemoria, setSelectedMemoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grupos, setGrupos] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [detailModal, setDetailModal] = useState({ isOpen: false, type: null, data: [] });

  useEffect(() => {
    loadMemorias();
    loadGrupos();
  }, []);

  const loadMemorias = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/memorias-anuales/`);
      const data = await response.json();
      // Ordenar por fecha de creación descendente (más reciente primero)
      const sortedData = data.sort((a, b) => {
        return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
      });
      setMemorias(sortedData);
    } catch (error) {
      console.error('Error cargando memorias:', error);
      setAlert({ type: 'error', message: 'Error al cargar las memorias anuales' });
    } finally {
      setLoading(false);
    }
  };

  const loadGrupos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grupos/`);
      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    }
  };

  const handleViewDetails = async (memoria) => {
    try {
      // Cargar detalles completos de la memoria
      const response = await fetch(`${API_BASE_URL}/api/memorias-anuales/${memoria.oidMemoriaAnual}/`);
      const data = await response.json();
      
      console.log('Cargando detalles para memoria:', memoria.oidMemoriaAnual);
      
      // Cargar relaciones
      const [integrantes, actividades, publicaciones, patentes, proyectos] = await Promise.all([
        fetch(`${API_BASE_URL}/api/integrantes-memoria/?MemoriaAnual=${memoria.oidMemoriaAnual}`).then(r => r.json()).catch(err => { console.error('Error integrantes:', err); return []; }),
        fetch(`${API_BASE_URL}/api/actividades-memoria/?MemoriaAnual=${memoria.oidMemoriaAnual}`).then(r => r.json()).catch(err => { console.error('Error actividades:', err); return []; }),
        fetch(`${API_BASE_URL}/api/publicaciones-memoria/?MemoriaAnual=${memoria.oidMemoriaAnual}`).then(r => r.json()).catch(err => { console.error('Error publicaciones:', err); return []; }),
        fetch(`${API_BASE_URL}/api/patentes-memoria/?MemoriaAnual=${memoria.oidMemoriaAnual}`).then(r => r.json()).catch(err => { console.error('Error patentes:', err); return []; }),
        fetch(`${API_BASE_URL}/api/proyectos-memoria/?MemoriaAnual=${memoria.oidMemoriaAnual}`).then(r => r.json()).catch(err => { console.error('Error proyectos:', err); return []; })
      ]);

      console.log('Integrantes:', integrantes);
      console.log('Actividades:', actividades);
      console.log('Publicaciones:', publicaciones);
      console.log('Patentes:', patentes);
      console.log('Proyectos:', proyectos);

      setSelectedMemoria({
        ...data,
        integrantes,
        actividades,
        publicaciones,
        patentes,
        proyectos
      });
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setAlert({ type: 'error', message: 'Error al cargar los detalles de la memoria' });
    }
  };

  const handleDelete = (oidMemoriaAnual) => {
    setConfirmModal({ isOpen: true, id: oidMemoriaAnual });
  };

  const confirmDelete = async () => {
    const oidMemoriaAnual = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/memorias-anuales/${oidMemoriaAnual}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Memoria eliminada exitosamente' });
        loadMemorias();
        setSelectedMemoria(null);
        // Resetear a la primera página si la actual queda vacía
        const newTotal = memorias.length - 1;
        const newTotalPages = Math.ceil(newTotal / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando memoria:', error);
      setAlert({ type: 'error', message: 'Error al eliminar la memoria' });
    }
  };

  const getGrupoNombre = (grupoId) => {
    const grupo = grupos.find(g => g.oidGrupoInvestigacion === grupoId);
    return grupo?.nombre || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR') + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const openDetailModal = (type, data) => {
    setDetailModal({ isOpen: true, type, data });
  };

  const closeDetailModal = () => {
    setDetailModal({ isOpen: false, type: null, data: [] });
  };

  const getModalTitle = () => {
    switch (detailModal.type) {
      case 'integrantes': return 'Integrantes';
      case 'actividades': return 'Actividades';
      case 'publicaciones': return 'Publicaciones';
      case 'patentes': return 'Patentes';
      case 'proyectos': return 'Proyectos';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="ver-memorias-container">
        <h1>Ver Memorias Anuales</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Cargando memorias...
        </div>
      </div>
    );
  }

  return (
    <div className="ver-memorias-container">
      {alert && (
        <Alert 
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="Eliminar Memoria Anual"
        message="¿Está seguro que desea eliminar esta memoria anual? Esta acción no se puede deshacer."
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />

      <div className="memorias-header">
        <h1>Memorias Anuales</h1>
      </div>

      {memorias.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No hay memorias anuales registradas</h3>
          <p>Crea tu primera memoria anual desde el menú lateral</p>
        </div>
      ) : (
        <div className="memorias-layout">
          <div className="memorias-list">
            <h2>Lista de Memorias</h2>
            {(() => {
              const totalPages = Math.ceil(memorias.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedMemorias = memorias.slice(startIndex, endIndex);
              
              return (
                <>
                  <div className="memorias-cards-container">
                    {paginatedMemorias.map((memoria) => (
              <div 
                key={memoria.oidMemoriaAnual} 
                className={`memoria-card ${selectedMemoria?.oidMemoriaAnual === memoria.oidMemoriaAnual ? 'selected' : ''}`}
                onClick={() => handleViewDetails(memoria)}
              >
                <div className="memoria-card-header">
                  <div className="memoria-year">
                    <Calendar size={20} />
                    <span>Año {memoria.ano}</span>
                  </div>
                  <div className="memoria-actions">
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(memoria);
                      }}
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(memoria.oidMemoriaAnual);
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="memoria-card-body">
                  <div className="memoria-titulo">
                    {memoria.titulo || 'Sin título'}
                  </div>
                  <div className="memoria-info">
                    <UsersIcon size={16} />
                    <span>{getGrupoNombre(memoria.GrupoInvestigacion)}</span>
                  </div>
                  <div className="memoria-meta">
                    <span className="memoria-date">
                      Creada: {formatDateTime(memoria.fechaCreacion)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>
                      <span className="pagination-info">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {selectedMemoria && (
            <div className="memoria-details">
              <div className="details-header">
                <h2>Detalles de la Memoria {selectedMemoria.ano}</h2>
                <button 
                  className="btn-close"
                  onClick={() => setSelectedMemoria(null)}
                >
                  ✕
                </button>
              </div>

              <div className="details-content">
                <div className="detail-section">
                  <h3>Información General</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Año:</label>
                      <span>{selectedMemoria.ano}</span>
                    </div>
                    <div className="detail-item">
                      <label>Grupo:</label>
                      <span>{getGrupoNombre(selectedMemoria.GrupoInvestigacion)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Título:</label>
                      <span>{selectedMemoria.titulo || 'Sin título'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Fecha Creación:</label>
                      <span>{formatDateTime(selectedMemoria.fechaCreacion)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Director:</label>
                      <span>{selectedMemoria.director_nombre || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Vicedirector:</label>
                      <span>{selectedMemoria.vicedirector_nombre || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {selectedMemoria.objetivosGenerales && (
                  <div className="detail-section">
                    <h3>Objetivos Generales</h3>
                    <p>{selectedMemoria.objetivosGenerales}</p>
                  </div>
                )}

                {selectedMemoria.objetivosEspecificos && (
                  <div className="detail-section">
                    <h3>Objetivos Específicos</h3>
                    <p>{selectedMemoria.objetivosEspecificos}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Resumen</h3>
                  <div className="summary-grid">
                    <div className="summary-item clickable" onClick={() => openDetailModal('integrantes', selectedMemoria.integrantes || [])}>
                      <div className="summary-number">{selectedMemoria.integrantes?.length || 0}</div>
                      <div className="summary-label">Integrantes</div>
                    </div>
                    <div className="summary-item clickable" onClick={() => openDetailModal('actividades', selectedMemoria.actividades || [])}>
                      <div className="summary-number">{selectedMemoria.actividades?.length || 0}</div>
                      <div className="summary-label">Actividades</div>
                    </div>
                    <div className="summary-item clickable" onClick={() => openDetailModal('publicaciones', selectedMemoria.publicaciones || [])}>
                      <div className="summary-number">{selectedMemoria.publicaciones?.length || 0}</div>
                      <div className="summary-label">Publicaciones</div>
                    </div>
                    <div className="summary-item clickable" onClick={() => openDetailModal('patentes', selectedMemoria.patentes || [])}>
                      <div className="summary-number">{selectedMemoria.patentes?.length || 0}</div>
                      <div className="summary-label">Patentes</div>
                    </div>
                    <div className="summary-item clickable" onClick={() => openDetailModal('proyectos', selectedMemoria.proyectos || [])}>
                      <div className="summary-number">{selectedMemoria.proyectos?.length || 0}</div>
                      <div className="summary-label">Proyectos</div>
                    </div>
                  </div>
                </div>

                {selectedMemoria.actividadesRealizadas && (
                  <div className="detail-section">
                    <h3>Actividades Realizadas</h3>
                    <p>{selectedMemoria.actividadesRealizadas}</p>
                  </div>
                )}

                {selectedMemoria.resultadosObtenidos && (
                  <div className="detail-section">
                    <h3>Resultados Obtenidos</h3>
                    <p>{selectedMemoria.resultadosObtenidos}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalles */}
      {detailModal.isOpen && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{getModalTitle()}</h2>
              <button className="btn-close" onClick={closeDetailModal}>✕</button>
            </div>
            <div className="modal-body">
              {detailModal.data.length === 0 ? (
                <p className="empty-message">No hay {getModalTitle().toLowerCase()} registrados</p>
              ) : (
                <div className="detail-list">
                  {detailModal.type === 'integrantes' && detailModal.data.map((item, index) => (
                    <div key={index} className="detail-list-item">
                      <div className="item-header">
                        <strong>{item.persona_nombre} {item.persona_apellido}</strong>
                      </div>
                      <div className="item-details">
                        <span><strong>Rol:</strong> {item.rol || 'N/A'}</span>
                        <span><strong>Horas semanales:</strong> {item.horasSemanales || 0}</span>
                      </div>
                    </div>
                  ))}
                  
                  {detailModal.type === 'actividades' && detailModal.data.map((item, index) => (
                    <div key={index} className="detail-list-item">
                      <div className="item-header">
                        <strong>{item.actividad_titulo || 'Sin título'}</strong>
                      </div>
                      <div className="item-details">
                        <p>{item.actividad_descripcion || 'Sin descripción'}</p>
                        {item.observaciones && <p><strong>Observaciones:</strong> {item.observaciones}</p>}
                      </div>
                    </div>
                  ))}
                  
                  {detailModal.type === 'publicaciones' && detailModal.data.map((item, index) => (
                    <div key={index} className="detail-list-item">
                      <div className="item-header">
                        <strong>{item.trabajo_titulo || 'Sin título'}</strong>
                      </div>
                      <div className="item-details">
                        <span><strong>Tipo:</strong> {item.trabajo_tipo || 'N/A'}</span>
                        {item.trabajo_issn && <span><strong>ISSN:</strong> {item.trabajo_issn}</span>}
                        {item.trabajo_doi && <span><strong>DOI:</strong> {item.trabajo_doi}</span>}
                        <span><strong>Estado:</strong> {item.trabajo_estado || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                  
                  {detailModal.type === 'patentes' && detailModal.data.map((item, index) => (
                    <div key={index} className="detail-list-item">
                      <div className="item-header">
                        <strong>{item.patente_tipo || 'Sin tipo'}</strong>
                      </div>
                      <div className="item-details">
                        <span><strong>Número:</strong> {item.patente_numero || 'N/A'}</span>
                        <span><strong>Inventor:</strong> {item.patente_inventor || 'N/A'}</span>
                        {item.patente_fecha && <span><strong>Fecha:</strong> {formatDate(item.patente_fecha)}</span>}
                        {item.patente_descripcion && <p><strong>Descripción:</strong> {item.patente_descripcion}</p>}
                      </div>
                    </div>
                  ))}
                  
                  {detailModal.type === 'proyectos' && detailModal.data.map((item, index) => (
                    <div key={index} className="detail-list-item">
                      <div className="item-header">
                        <strong>{item.proyecto_titulo || 'Sin título'}</strong>
                      </div>
                      <div className="item-details">
                        {item.proyecto_descripcion && <p>{item.proyecto_descripcion}</p>}
                        {item.proyecto_fechaInicio && <span><strong>Inicio:</strong> {formatDate(item.proyecto_fechaInicio)}</span>}
                        {item.proyecto_fechaFin && <span><strong>Fin:</strong> {formatDate(item.proyecto_fechaFin)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerMemorias;
