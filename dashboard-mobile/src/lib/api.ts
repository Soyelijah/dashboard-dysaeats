import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/store';
import { clearCredentials } from '@/store/slices/authSlice';

const baseURL = process.env.API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh or logout on 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data;
          await AsyncStorage.setItem('token', token);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, logout the user
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        store.dispatch(clearCredentials());
      }
    }

    return Promise.reject(error);
  }
);
