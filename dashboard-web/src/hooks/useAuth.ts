'use client';

import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real implementation, we would check token validity here
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Mock user for development
    const mockUser = {
      id: '1',
      email: 'restaurant@dysaeats.com',
      firstName: 'Restaurant',
      lastName: 'Owner',
      role: 'restaurant',
    };
    
    // Simulate authentication if token exists
    if (token) {
      setUser(mockUser);
      setIsAuthenticated(true);
    } else {
      // For demo purposes, we'll still authenticate the user
      // In real app, we would redirect to login
      localStorage.setItem('token', 'mock-token');
      setUser(mockUser);
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock successful login for demo purposes
    const mockUser = {
      id: '1',
      email,
      firstName: 'Restaurant',
      lastName: 'Owner',
      role: 'restaurant',
    };
    
    localStorage.setItem('token', 'mock-token');
    setUser(mockUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};