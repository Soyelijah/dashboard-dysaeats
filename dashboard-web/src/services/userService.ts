import api from '@/lib/api';
import { Role } from '@/types/user';

// Get user profile
export const getUserProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

// Get all users with pagination and filters
export const getUsers = async (params: {
  page?: number;
  limit?: number;
  role?: Role;
  searchQuery?: string;
}) => {
  const { data } = await api.get('/users', { params });
  return data;
};

// Get available delivery persons (with status 'available')
export const getAvailableDeliveryPersons = async () => {
  const { data } = await api.get('/users', { 
    params: { 
      role: 'delivery',
      status: 'available'
    } 
  });
  return data;
};

// Get user by ID
export const getUserById = async (id: string) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

// Create new user
export const createUser = async (userData: any) => {
  const { data } = await api.post('/users', userData);
  return data;
};

// Update user
export const updateUser = async (id: string, userData: any) => {
  const { data } = await api.patch(`/users/${id}`, userData);
  return data;
};

// Delete user
export const deleteUser = async (id: string) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};