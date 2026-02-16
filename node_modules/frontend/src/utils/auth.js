export const setToken = (token) => {
    localStorage.setItem('authToken', token);
};

export const getToken = () => {
    return localStorage.getItem('authToken');
};

export const removeToken = () => {
    localStorage.removeItem('authToken');
};

export const setRefreshToken = (token) => {
    localStorage.setItem('refreshToken', token);
};

export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

export const removeRefreshToken = () => {
    localStorage.removeItem('refreshToken');
};

export const setUserData = (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
};

export const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

export const removeUserData = () => {
    localStorage.removeItem('userData');
};

export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    return true;
};

export const login = async (email, password) => {
    try {
        const response = await fetch('http://localhost:8000/api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo: email,
                contrasena: password
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al iniciar sesión');
        }

        const data = await response.json();

        if (data.tokens?.access) {
            setToken(data.tokens.access);
        }
        if (data.tokens?.refresh) {
            setRefreshToken(data.tokens.refresh);
        }
        if (data.persona) {
            setUserData(data.persona);
        }

        return {
            user: data.persona,
            token: data.tokens?.access,
            refresh: data.tokens?.refresh
        };
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await fetch('http://localhost:8000/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if(!response.ok) {
            throw new Error('Error al registrar usuario');
        }

        const data = await response.json();

        if (data.token) {
            setToken(data.token);
        }

        if (data.user) {
            setUserData(data.user);
        }

        return data;
    } catch (error) {
        console.error('Error en registro:', error);
        throw error;
    }
};

export const logout = () => {
    removeToken();
    removeRefreshToken();
    removeUserData();
};

export const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}`}),
    };
};

export const authenticatedFetch = async (url, options = {}) => {
    const headers = getAuthHeaders();

    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    });

    if (response.status === 401) {
        // try to refresh access token using the refresh token
        const refresh = getRefreshToken();
        if (refresh) {
            try {
                const r = await fetch('http://localhost:8000/api/auth/refresh/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh })
                });
                if (r.ok) {
                    const rjson = await r.json().catch(() => null);
                    const newAccess = rjson?.access;
                    if (newAccess) {
                        setToken(newAccess);
                        // retry original request with new token
                        const headers2 = getAuthHeaders();
                        const retry = await fetch(url, {
                            ...options,
                            headers: {
                                ...headers2,
                                ...options.headers,
                            },
                        });
                        if (retry.status !== 401) return retry;
                        // if retry 401, fall through and logout
                    }
                }
            } catch {
                // fall back to logout
            }
        }

        // no refresh token, or refresh failed => log out
        logout();
        window.location.href = '/';
        throw new Error('Sesión expirada');
    }

    return response;
};