import api from './api';
import { Role, UserStatus } from '../types/user';

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  role?: Role;
  status?: UserStatus;
  search?: string;
}

// Get user profile (current user)
export const getUserProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data;
};

// Get all users with pagination and filters
export const getUsers = async (params: UsersQueryParams) => {
  const { data } = await api.get('/users', { params });
  return data;
};

// Get available delivery persons
export const getAvailableDeliveryPersons = async () => {
  const { data } = await api.get('/users', { 
    params: { 
      role: Role.DELIVERY,
      status: UserStatus.AVAILABLE 
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