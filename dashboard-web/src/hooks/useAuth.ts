import { useState, useEffect, useCallback } from 'react';
import { setCookie, deleteCookie } from 'cookies-next';
import { authService } from '@/services/supabase'; // backend service
import apiClient from '@/lib/api-client'; // frontend client

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      document.cookie = 'accessToken=; path=/; max-age=0';
    }

    deleteCookie('accessToken');
    deleteCookie('userData');

    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window === 'undefined') return;

        setIsLoading(true);

        const currentUser = await apiClient.auth.getCurrentUser();

        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            role: currentUser.role,
          });
          setIsAuthenticated(true);
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [clearAuthData]);

  const login = async (email: string, password: string, isAdminLogin = false) => {
    try {
      setIsLoading(true);
  
      const { user, token } = await apiClient.auth.login(email, password);
  
      if (!user) {
        throw new Error('Credenciales inválidas');
      }
  
      // Validaciones de rol
      if (isAdminLogin && user.role !== 'admin') {
        throw new Error('No tienes permisos de administrador para acceder a esta área');
      }
  
      if (!isAdminLogin && user.role !== 'restaurant_admin') {
        throw new Error('No tienes permisos para acceder a esta área de restaurante');
      }
  
      setUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
  
      setIsAuthenticated(true);
  
      setCookie('userData', JSON.stringify(user), { path: '/' });
      setCookie('accessToken', token, { path: '/' });
  
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };  

  const logout = useCallback(async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  }, [clearAuthData]);

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
  
      // Forzar el rol 'restaurant_admin'
      const userPayload = {
        ...userData,
        role: 'restaurant_admin',
      };
  
      const result = await apiClient.auth.register(userPayload);
  
      if (result?.user) {
        setUser({
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
        });
  
        setIsAuthenticated(true);
        setCookie('userData', JSON.stringify(result.user), { path: '/' });
      }
  
      return result;
    } catch (error: any) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };  

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };
};

export default useAuth;
