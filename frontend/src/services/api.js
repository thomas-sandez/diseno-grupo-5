import { authenticatedFetch } from '../utils/auth';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:8000/api';

// Función para hacer login
export const login = async (email, password) => {
  const loginData = {
    correo: email,
    contrasena: password
  };

  console.log('=== LOGIN REQUEST ===');
  console.log('URL:', `${API_BASE_URL}/auth/login/`);
  console.log('Datos enviados:', loginData);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Error en el login');
    }

    // Guardar tokens en localStorage
    if (data.tokens) {
      localStorage.setItem('authToken', data.tokens.access);
      localStorage.setItem('refreshToken', data.tokens.refresh);
      console.log('Tokens guardados en localStorage');
    }

    // Guardar datos del usuario
    if (data.persona) {
      localStorage.setItem('userData', JSON.stringify(data.persona));
      console.log('Datos de usuario guardados');
    }

    console.log('=== LOGIN SUCCESS ===');
    return data;

  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error:', error);
    throw error;
  }
};

// Función para logout
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  console.log('Sesión cerrada y tokens eliminados');
};

// Función para obtener el token de acceso
export const getAccessToken = () => {
  return localStorage.getItem('authToken');
};

// Función para verificar si hay sesión activa
export const isAuthenticated = () => {
  return !!getAccessToken();
};

// Función para obtener datos del usuario
export const getUser = () => {
  const userStr = localStorage.getItem('userData');
  return userStr ? JSON.parse(userStr) : null;
};

// Función para obtener el perfil completo del usuario desde el backend
export const getPerfil = async (oidpersona) => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/perfil/${oidpersona}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener el perfil');
    }

    const data = await response.json();
    return data.persona || data;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    throw error;
  }
};

// Función para actualizar el perfil del usuario
export const actualizarPerfil = async (oidpersona, perfilData) => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/perfil/${oidpersona}/actualizar/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(perfilData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar el perfil');
    }

    const data = await response.json();
    
    // Actualizar datos en localStorage
    if (data.persona) {
      localStorage.setItem('userData', JSON.stringify(data.persona));
    }
    
    return data;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
};

// Función para cambiar contraseña
export const cambiarContrasena = async (oidpersona, passwordData) => {
  const token = getAccessToken();
  
  console.log('=== API: cambiarContrasena ===');
  console.log('oidpersona:', oidpersona);
  console.log('passwordData keys:', Object.keys(passwordData));
  console.log('URL:', `${API_BASE_URL}/auth/perfil/${oidpersona}/cambiar-contrasena/`);
  
  if (!token) {
    throw new Error('No hay sesión activa');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/perfil/${oidpersona}/cambiar-contrasena/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'Error al cambiar la contraseña');
    }

    const data = await response.json();
    console.log('Success response:', data);
    return data;
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    throw error;
  }
};

// Función para obtener opciones de perfil
export const getOpcionesPerfil = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/opciones-perfil/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener opciones de perfil');
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo opciones:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES DE CONEXIÓN BACKEND - TRABAJOS, PATENTES Y REGISTROS
// ============================================

export async function crearTrabajoPublicado(data) {
    const response = await authenticatedFetch('http://localhost:8000/api/trabajos-publicados/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }

    return json;
}

export async function listarTrabajosPublicados(page = 1, pageSize = 10) {
    const response = await authenticatedFetch(`http://localhost:8000/api/trabajos-publicados/?page=${page}&page_size=${pageSize}`);
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarPublicaciones() {
    const response = await authenticatedFetch('http://localhost:8000/api/trabajos-publicados/?estado=Publicado');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function actualizarTrabajoPublicado(id, data) {
    const response = await authenticatedFetch(`http://localhost:8000/api/trabajos-publicados/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function eliminarTrabajoPublicado(id) {
    const response = await authenticatedFetch(`http://localhost:8000/api/trabajos-publicados/${id}/`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = `HTTP ${response.status}`;
        throw new Error(err);
    }
    return true;
}

export async function crearPatente(data) {
    const response = await authenticatedFetch('http://localhost:8000/api/patentes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarGrupos() {
    const response = await authenticatedFetch('http://localhost:8000/api/grupos/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function crearRegistro(data) {
    const response = await authenticatedFetch('http://localhost:8000/api/registros/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        // throw the parsed json (if any) so the caller can display validation errors
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarRegistros(page = 1, pageSize = 10) {
    const response = await authenticatedFetch(`http://localhost:8000/api/registros/?page=${page}&page_size=${pageSize}`);
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarPatentes(page = 1, pageSize = 10) {
    const response = await authenticatedFetch(`http://localhost:8000/api/patentes/?page=${page}&page_size=${pageSize}`);
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarProyectos() {
    const response = await authenticatedFetch('http://localhost:8000/api/proyectos/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function crearProyecto(data) {
    const response = await authenticatedFetch('http://localhost:8000/api/proyectos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function actualizarProyecto(id, data) {
    const response = await authenticatedFetch(`http://localhost:8000/api/proyectos/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function eliminarProyecto(id) {
    const response = await authenticatedFetch(`http://localhost:8000/api/proyectos/${id}/`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = `HTTP ${response.status}`;
        throw new Error(err);
    }
    return true;
}

export async function listarTipoRegistros() {
    const response = await authenticatedFetch('http://localhost:8000/api/tipo-registros/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function crearTrabajoPresentado(data) {
    const response = await authenticatedFetch('http://localhost:8000/api/trabajos-presentados/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarTrabajosPresentados(page = 1, pageSize = 10) {
    const response = await authenticatedFetch(`http://localhost:8000/api/trabajos-presentados/?page=${page}&page_size=${pageSize}`);
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarActividades() {
    const response = await authenticatedFetch('http://localhost:8000/api/actividades/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarLineasInvestigacion() {
    const response = await authenticatedFetch('http://localhost:8000/api/lineas-investigacion/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function crearActividad(data) {
    const response = await authenticatedFetch('http://localhost:8000/api/actividades/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarAutores() {
    const response = await authenticatedFetch('http://localhost:8000/api/autores/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function crearAutor(data) {
    const response = await authenticatedFetch('http://localhost:8000/api/autores/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function listarTiposTrabajoPublicado() {
    const response = await authenticatedFetch('http://localhost:8000/api/tipo-trabajos-publicados/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

// Trabajos Presentados
export async function actualizarTrabajoPresentado(id, data) {
    const response = await authenticatedFetch(`http://localhost:8000/api/trabajos-presentados/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function eliminarTrabajoPresentado(id) {
    const response = await authenticatedFetch(`http://localhost:8000/api/trabajos-presentados/${id}/`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = `HTTP ${response.status}`;
        throw new Error(err);
    }
    return true;
}

// Registros
export async function actualizarRegistro(id, data) {
    const response = await authenticatedFetch(`http://localhost:8000/api/registros/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function eliminarRegistro(id) {
    const response = await authenticatedFetch(`http://localhost:8000/api/registros/${id}/`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = `HTTP ${response.status}`;
        throw new Error(err);
    }
    return true;
}

// Patentes
export async function actualizarPatente(id, data) {
    const response = await authenticatedFetch(`http://localhost:8000/api/patentes/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function eliminarPatente(id) {
    const response = await authenticatedFetch(`http://localhost:8000/api/patentes/${id}/`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = `HTTP ${response.status}`;
        throw new Error(err);
    }
    return true;
}

// Grupos de Investigación
export async function crearGrupo(grupoData) {
    const response = await authenticatedFetch('http://localhost:8000/api/grupos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: grupoData.nombreGrupo,
            sigla: grupoData.siglasGrupo,
            facultadReginalAsignada: grupoData.facultad,
            correo: grupoData.correo,
            organigrama: grupoData.objetivos,
            fuenteFinanciamiento: grupoData.financiamiento,
            ProgramaActividades: 1 // Valor por defecto, ajustar según necesidad
        })
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function obtenerGrupos() {
    const response = await authenticatedFetch('http://localhost:8000/api/grupos/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function obtenerPersonas() {
    const response = await authenticatedFetch('http://localhost:8000/api/auth/personas/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json.personas || json;
}

export async function crearPersona(personaData) {
    const response = await authenticatedFetch('http://localhost:8000/api/personas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaData)
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function obtenerOpcionesPerfil() {
    const response = await authenticatedFetch('http://localhost:8000/api/auth/opciones-perfil/');
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function actualizarGrupo(id, grupoData) {
    const response = await authenticatedFetch(`http://localhost:8000/api/grupos/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: grupoData.nombreGrupo,
            sigla: grupoData.siglasGrupo,
            facultadReginalAsignada: grupoData.facultad,
            correo: grupoData.correo,
            organigrama: grupoData.objetivos,
            fuenteFinanciamiento: grupoData.financiamiento,
            ProgramaActividades: 1 // Valor por defecto, ajustar según necesidad
        })
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
        const err = json ? JSON.stringify(json) : `HTTP ${response.status}`;
        throw new Error(err);
    }
    return json;
}

export async function eliminarGrupo(id) {
    const response = await authenticatedFetch(`http://localhost:8000/api/grupos/${id}/`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = `HTTP ${response.status}`;
        throw new Error(err);
    }
    return true;
}

export default {
  login,
  logout,
  getAccessToken,
  isAuthenticated,
  getUser,
  getPerfil,
  actualizarPerfil,
  getOpcionesPerfil
};
