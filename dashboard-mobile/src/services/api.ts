import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

// Create axios instance
const api = axios.create({
  baseURL: Config.API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // If no refresh token, logout
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('refreshToken');
          // Handle redirect to login in your auth context
          return Promise.reject(error);
        }
        
        const response = await axios.post(
          `${Config.API_URL || 'http://localhost:3000/api'}/auth/refresh`,
          { refreshToken }
        );
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Save the new tokens
        await AsyncStorage.setItem('token', accessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Update auth header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry the original request
        return api(originalRequest);
        
      } catch (refreshError) {
        // If refresh fails, logout
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        // Handle redirect to login in your auth context
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;