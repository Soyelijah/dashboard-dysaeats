import { supabase } from './client';

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
};

export const authService = {
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    rut: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      const email = userData.email.trim().toLowerCase();
      const password = userData.password;
      const firstName = userData.firstName.trim();
      const lastName = userData.lastName.trim();
      const rut = userData.rut.trim();
      const phone = userData.phone?.trim() || null;
      const address = userData.address?.trim() || null;
      const role = 'restaurant_admin'; // 🔒 rol fijo para web

      if (!email || !password || !firstName || !lastName || !rut) {
        throw new Error('Faltan campos obligatorios para el registro');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('El formato del correo electrónico es inválido');
      }

      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email, rut')
        .or(`email.eq."${email}",rut.eq."${rut}"`)
        .limit(1)
        .maybeSingle();

      if (checkError) {
        console.error('Error al verificar existencia de usuario:', checkError);
        throw new Error('No se pudo verificar si el usuario ya existe');
      }

      if (existingUser) {
        if (existingUser.email === email) throw new Error('Ya existe una cuenta registrada con este correo');
        if (existingUser.rut === rut) throw new Error('Ya existe una cuenta registrada con este RUT');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
          },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/es/login?confirmed=true`,
        },
      });

      if (authError || !authData?.user?.id) {
        console.error('Error en Supabase Auth:', authError);
        throw new Error(authError?.message || 'Error al registrar usuario en Auth');
      }

      const userId = authData.user.id;

      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfile) {
        console.warn('Perfil ya existe con este ID:', userId);

        if (!existingProfile.first_name || !existingProfile.last_name || !existingProfile.rut) {
          const { error: updateError } = await supabase
            .from('users')
            .update({
              first_name: firstName,
              last_name: lastName,
              rut,
              phone,
              address,
              role,
              password: null,
              updated_at: new Date(),
            })
            .eq('id', userId);

          if (updateError) {
            await supabase.auth.admin.deleteUser(userId);
            throw new Error('Error al actualizar perfil. Intenta con otro correo.');
          }

          return {
            success: true,
            user: { id: userId, email, firstName, lastName, role },
            message: 'Registro completado exitosamente. Confirma tu correo electrónico para iniciar sesión.',
          };
        } else {
          await supabase.auth.admin.deleteUser(userId);
          throw new Error('Ya existe una cuenta con este correo. Por favor intenta con otro.');
        }
      }

      const { error: profileError } = await supabase.from('users').insert([{
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        rut,
        phone,
        address,
        role,
        password: null,
      }]);

      if (profileError) {
        await supabase.auth.admin.deleteUser(userId);
        throw new Error('Error al crear perfil del usuario. Intenta con otro correo o RUT.');
      }

      return {
        success: true,
        user: { id: userId, email, firstName, lastName, role },
        message: 'Registro exitoso. Confirma tu correo electrónico para iniciar sesión.',
      };
    } catch (error: any) {
      console.error('Error en el registro:', error);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        if (error?.message?.toLowerCase().includes('email not confirmed')) {
          throw new Error('Debes confirmar tu correo electrónico antes de iniciar sesión.');
        }
        throw new Error('Credenciales inválidas');
      }

      const role = data.user.user_metadata?.role || 'restaurant_admin';

      const user = {
        id: data.user.id,
        email: data.user.email || '',
        firstName: data.user.user_metadata?.first_name,
        lastName: data.user.user_metadata?.last_name,
        role,
      };

      const token = data.session.access_token;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
        document.cookie = `accessToken=${token}; path=/; max-age=86400`;
      }

      return { user, token };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        document.cookie = 'accessToken=; path=/; max-age=0';
      }
      await supabase.auth.signOut();
      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      return false;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return null;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      return {
        id: userData.user.id,
        email: userData.user.email || '',
        firstName: userData.user.user_metadata?.first_name,
        lastName: userData.user.user_metadata?.last_name,
        role: userData.user.user_metadata?.role || 'restaurant_admin',
      };
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  },

  refreshToken: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) throw new Error('No se pudo refrescar la sesión');

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.session.access_token);
        document.cookie = `accessToken=${data.session.access_token}; path=/; max-age=86400`;
      }

      return {
        token: data.session.access_token,
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          role: data.user?.user_metadata?.role || 'restaurant_admin',
        },
      };
    } catch (error) {
      console.error('Error al refrescar token:', error);
      throw error;
    }
  },

  requestPasswordReset: async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      throw error;
    }
  },

  updatePassword: async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  },

  signInWithGoogle: async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  },

  signInWithOTP: async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error enviando OTP:', error);
      throw error;
    }
  },

  verifyOTP: async (email: string, token: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error verificando OTP:', error);
      throw error;
    }
  },
}; 
