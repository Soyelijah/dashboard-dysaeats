import axios from 'axios';

<<<<<<< HEAD
// Este archivo se mantiene por compatibilidad con código anterior, pero
// la aplicación está migrando a usar el cliente Supabase directamente

// Get API URL from environment variables with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Configure axios instance with environment variables
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies in cross-origin requests
=======
// Configura la instancia base de axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Permite enviar cookies en solicitudes cross-origin
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
});

// Interceptor para agregar el token de autenticación a cada solicitud
api.interceptors.request.use(
  (config) => {
    // Si estamos en el cliente, obtén el token del localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (Unauthorized) y no hemos intentado refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar obtener un nuevo token con refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Si no hay refresh token, forzar logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // Llamar al endpoint de refresh token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        if (response.data.accessToken) {
          // Guardar el nuevo token
          localStorage.setItem('token', response.data.accessToken);
          
          // Si también devuelve un nuevo refresh token
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }

          // Actualizar el header de autorización
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

          // Reintentar la solicitud original
          return api(originalRequest);
        }
      } catch (error) {
        // Si falla el refresh, forzar logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;