import { supabase, Tables } from './client';

export type User = Tables['users'];
export type UserRole = 'admin' | 'restaurant_admin' | 'customer' | 'delivery_person';

export const userService = {
  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting user:', error);
      throw error;
    }
    
    return data as User;
  },
  
  // Get user by email
  getUserByEmail: async (email: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
    
    return data as User | null;
  },
  
  // Update user profile
  updateUserProfile: async (
    userId: string,
    userData: Partial<User>
  ): Promise<User> => {
    // Add updated_at timestamp
    const dataWithTimestamp = {
      ...userData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('users')
      .update(dataWithTimestamp)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    // Also update user_metadata in auth if first_name, last_name, or role changes
    if (userData.first_name || userData.last_name || userData.role) {
      try {
        // This requires admin privileges, so it's only available on the server
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...(userData.first_name && { first_name: userData.first_name }),
            ...(userData.last_name && { last_name: userData.last_name }),
            ...(userData.role && { role: userData.role })
          }
        });
      } catch (e) {
        console.warn('Could not update auth metadata (this is expected in client-side calls):', e);
      }
    }
    
    return data as User;
  },
  
  // Get users by role
  getUsersByRole: async (
    role: UserRole,
    params: {
      page?: number;
      limit?: number;
      searchQuery?: string;
    } = {}
  ): Promise<{
    data: User[];
    count: number;
  }> => {
    const { page = 1, limit = 10, searchQuery } = params;
    
    // Calculate range for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', role)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    // Add search filter if provided
    if (searchQuery) {
      query = query.or(
        `email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
      );
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error(`Error getting ${role} users:`, error);
      throw error;
    }
    
    return {
      data: data as User[],
      count: count || 0
    };
  },
  
  // Create a new user (server-side only)
  createUser: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    rut?: string;
    phone?: string;
    address?: string;
  }): Promise<User> => {
    // This function should only be called server-side as it requires admin privileges
    
    // Normalize data
    const email = userData.email.trim().toLowerCase();
    const password = userData.password;
    const firstName = userData.firstName.trim();
    const lastName = userData.lastName.trim();
    const role = userData.role;
    const rut = userData.rut?.trim();
    const phone = userData.phone?.trim();
    const address = userData.address?.trim();
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role
      }
    });
    
    if (authError || !authData.user) {
      console.error('Error creating user in Supabase Auth:', authError);
      throw authError || new Error('Failed to create user');
    }
    
    // Create user profile in 'users' table
    const { data: userData_, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        rut,
        phone,
        address,
        role
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
      
      // Attempt to clean up the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (e) {
        console.error('Error cleaning up auth user after profile creation failed:', e);
      }
      
      throw profileError;
    }
    
    return userData_ as User;
  },
  
  // Delete user (server-side only)
  deleteUser: async (userId: string): Promise<boolean> => {
    // This function should only be called server-side as it requires admin privileges
    
    // First delete from users table
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      throw profileError;
    }
    
    // Then delete from auth
    try {
      await supabase.auth.admin.deleteUser(userId);
    } catch (e) {
      console.error('Error deleting user from auth:', e);
      throw e;
    }
    
    return true;
  },
  
  // Change user password (for authenticated user)
  changePassword: async (newPassword: string): Promise<boolean> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Error updating password:', error);
      throw error;
    }
    
    return true;
  },
  
  // Request password reset
  requestPasswordReset: async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
    
    return true;
  }
};