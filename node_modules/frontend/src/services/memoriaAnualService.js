import {
  memoriaAnualService,
  integranteService,
  trabajoService,
  actividadService,
  publicacionService,
  patenteService,
  proyectoService,
} from './api';

/**
 * Servicio para manejar toda la lógica de negocio de Memoria Anual
 */
export const MemoriaAnualService = {
  /**
   * Guarda una memoria anual completa con todos sus datos relacionados
   * @param {Object} formData - Los datos del formulario de memoria anual
   * @returns {Promise<Object>} - La memoria anual creada con todos sus datos
   */
  async guardarMemoriaCompleta(formData) {
    try {
      // 1. Crear la memoria anual principal
      const memoriaData = {
        anio: formData.anio,
        numero: formData.numero,
        estado: formData.estado || 'Borrador',
        introduccion: formData.introduccion || '',
        titulo_introduccion: formData.tituloIntroduccion || '',
        GrupoInvestigacion: formData.grupoInvestigacionId || 1, // Ajustar según tu lógica
      };

      const memoria = await memoriaAnualService.create(memoriaData);
      const memoriaId = memoria.oidMemoriaAnual;

      // 2. Guardar todos los integrantes
      const integrantesPromises = formData.integrantes.map((integrante) => {
        return integranteService.create({
          nombre: integrante.nombre,
          apellido: integrante.apellido,
          rol: integrante.rol,
          horas: parseInt(integrante.horas) || 0,
          memoria: memoriaId,
        });
      });

      // 3. Guardar todos los trabajos
      const trabajosPromises = formData.trabajos.map((trabajo) => {
        return trabajoService.create({
          ciudad: trabajo.ciudad,
          fecha: trabajo.fecha,
          reunion: trabajo.reunion,
          titulo: trabajo.titulo,
          memoria: memoriaId,
        });
      });

      // 4. Guardar todas las actividades
      const actividadesPromises = formData.actividades.map((actividad) => {
        return actividadService.create({
          titulo: actividad.titulo,
          descripcion: actividad.descripcion,
          fecha: actividad.fecha,
          tipo: actividad.tipo,
          memoria: memoriaId,
        });
      });

      // 5. Guardar todas las publicaciones
      const publicacionesPromises = formData.publicaciones.map((publicacion) => {
        return publicacionService.create({
          titulo: publicacion.titulo,
          autor: publicacion.autor,
          revista: publicacion.revista,
          anio: parseInt(publicacion.anio) || new Date().getFullYear(),
          memoria: memoriaId,
        });
      });

      // 6. Guardar todas las patentes
      const patentesPromises = formData.patentes.map((patente) => {
        return patenteService.create({
          titulo: patente.titulo,
          numero: patente.numero,
          fecha: patente.fecha,
          estado: patente.estado,
          memoria: memoriaId,
        });
      });

      // 7. Guardar todos los proyectos
      const proyectosPromises = formData.proyectos.map((proyecto) => {
        return proyectoService.create({
          nombre: proyecto.nombre,
          estado: proyecto.estado,
          inicio: proyecto.inicio,
          fin: proyecto.fin,
          responsable: proyecto.responsable,
          responsable_titulo: proyecto.responsableTitulo || '',
          presupuesto: proyecto.presupuesto,
          colaboradores: proyecto.colaboradores,
          colaboradores_titulo: proyecto.colaboradoresTitulo || '',
          objetivos: proyecto.objetivos,
          objetivos_titulo: proyecto.objetivosTitulo || '',
          resultados: proyecto.resultados,
          resultados_titulo: proyecto.resultadosTitulo || '',
          memoria: memoriaId,
        });
      });

      // Ejecutar todas las promesas en paralelo
      await Promise.all([
        ...integrantesPromises,
        ...trabajosPromises,
        ...actividadesPromises,
        ...publicacionesPromises,
        ...patentesPromises,
        ...proyectosPromises,
      ]);

      // Obtener la memoria completa con todos sus datos
      const memoriaCompleta = await memoriaAnualService.getById(memoriaId);

      return {
        success: true,
        data: memoriaCompleta,
        message: 'Memoria anual guardada exitosamente',
      };
    } catch (error) {
      console.error('Error al guardar memoria anual:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Error al guardar la memoria anual',
      };
    }
  },

  /**
   * Actualiza una memoria anual existente
   * @param {number} memoriaId - ID de la memoria a actualizar
   * @param {Object} formData - Los datos actualizados
   * @returns {Promise<Object>} - El resultado de la actualización
   */
  async actualizarMemoriaCompleta(memoriaId, formData) {
    try {
      // Actualizar datos principales de la memoria
      const memoriaData = {
        anio: formData.anio,
        numero: formData.numero,
        estado: formData.estado,
        introduccion: formData.introduccion,
        titulo_introduccion: formData.tituloIntroduccion,
      };

      await memoriaAnualService.update(memoriaId, memoriaData);

      // Aquí podrías implementar lógica para actualizar integrantes, trabajos, etc.
      // Por ahora retornamos éxito

      return {
        success: true,
        message: 'Memoria anual actualizada exitosamente',
      };
    } catch (error) {
      console.error('Error al actualizar memoria anual:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Error al actualizar la memoria anual',
      };
    }
  },

  /**
   * Obtiene todas las memorias anuales
   * @returns {Promise<Array>} - Lista de memorias anuales
   */
  async obtenerTodasLasMemorias() {
    try {
      const memorias = await memoriaAnualService.getAll();
      return {
        success: true,
        data: memorias,
      };
    } catch (error) {
      console.error('Error al obtener memorias:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: [],
      };
    }
  },

  /**
   * Obtiene una memoria anual por ID
   * @param {number} id - ID de la memoria
   * @returns {Promise<Object>} - Los datos de la memoria
   */
  async obtenerMemoriaPorId(id) {
    try {
      const memoria = await memoriaAnualService.getById(id);
      return {
        success: true,
        data: memoria,
      };
    } catch (error) {
      console.error('Error al obtener memoria:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: null,
      };
    }
  },

  /**
   * Elimina una memoria anual
   * @param {number} id - ID de la memoria a eliminar
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async eliminarMemoria(id) {
    try {
      await memoriaAnualService.delete(id);
      return {
        success: true,
        message: 'Memoria anual eliminada exitosamente',
      };
    } catch (error) {
      console.error('Error al eliminar memoria:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Error al eliminar la memoria anual',
      };
    }
  },
};

export default MemoriaAnualService;
