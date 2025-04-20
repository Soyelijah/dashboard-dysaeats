'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { verifyAuth } from '@/lib/supabase';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/common/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/common/alert-dialog';
import { Input } from '@/components/common/form-input';
import { Button } from '@/components/common/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // For backwards compatibility
  email: string;
  role: string;
  rut?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  birthday?: string;
  imageApproved?: boolean;
  createdAt?: string;
};

const userFormSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['customer', 'restaurant_admin', 'delivery_person', 'admin', 'super_admin']),
  rut: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().optional(),
  birthday: z.string().optional(),
  imageApproved: z.boolean().default(false).optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
  });
  
  // Función para traducir roles a español
  const translateRole = (role: string): string => {
    const roleTranslations: Record<string, string> = {
      'admin': 'Administrador',
      'super_admin': 'Super Administrador',
      'restaurant_admin': 'Administrador de Restaurante',
      'delivery_person': 'Repartidor',
      'customer': 'Cliente'
    };
    
    return roleTranslations[role] || role;
  };
  
  // Función para formatear RUT chileno
  const formatRut = (rut: string): string => {
    // Eliminar cualquier punto o guión que ya tenga el RUT
    let value = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Si está vacío, devolver vacío
    if (!value) return '';
    
    // Si tiene dígito verificador, separarlo
    let dv = '';
    if (value.length > 1) {
      dv = value.slice(-1);
      value = value.slice(0, -1);
    }
    
    // Invertir para agregar puntos cada 3 caracteres
    let formattedRut = '';
    let count = 0;
    
    for (let i = value.length - 1; i >= 0; i--) {
      formattedRut = value[i] + formattedRut;
      count++;
      
      if (count === 3 && i !== 0) {
        formattedRut = '.' + formattedRut;
        count = 0;
      }
    }
    
    // Agregar el dígito verificador si existe
    if (dv) {
      formattedRut += '-' + dv;
    }
    
    return formattedRut;
  };

  useEffect(() => {
    // Intentar cargar datos reales desde el backend
    fetchUsers();
  }, []);

  useEffect(() => {
    if (editingUser) {
      // Split the name into firstName and lastName if needed
      const nameParts = editingUser.name ? editingUser.name.split(' ') : ['', ''];
      const firstName = editingUser.firstName || nameParts[0] || '';
      const lastName = editingUser.lastName || nameParts.slice(1).join(' ') || '';
      
      setValue('firstName', firstName);
      setValue('lastName', lastName);
      setValue('email', editingUser.email);
      setValue('role', editingUser.role as any);
      
      // Cargar campos adicionales si existen
      if (editingUser.rut) setValue('rut', editingUser.rut);
      if (editingUser.phone) setValue('phone', editingUser.phone);
      if (editingUser.address) setValue('address', editingUser.address);
      if (editingUser.profileImage) setValue('profileImage', editingUser.profileImage);
      if (editingUser.birthday) setValue('birthday', editingUser.birthday);
      if (editingUser.imageApproved !== undefined) setValue('imageApproved', editingUser.imageApproved);
    }
  }, [editingUser, setValue]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticación primero
      const isAuthenticated = await verifyAuth();
      
      if (!isAuthenticated) {
        setError('Usuario no autenticado. Por favor inicie sesión.');
        return;
      }
      
      // Si está autenticado, cargar los usuarios
      const data = await adminService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (data: UserFormData) => {
    try {
      setLoading(true);
      
      // Asegurarse de que el RUT esté formateado correctamente
      if (data.rut) {
        data.rut = formatRut(data.rut.replace(/\./g, '').replace(/-/g, ''));
      }
      
      // Imprimir datos que estamos enviando
      console.log('Datos de usuario a crear:', data);
      
      // Los datos ya tienen el formato correcto firstName, lastName
      // Solo aseguramos que el rol sea en minúsculas 
      const userData = {
        ...data,
        // El rol ya está en minúsculas según nuestra validación
      };
      
      console.log('Datos procesados para enviar:', userData);
      
      // Intentar crear el usuario
      const result = await adminService.createUser(userData);
      console.log('Respuesta del servidor:', result);
      
      setIsAddDialogOpen(false);
      reset();
      await fetchUsers();
    } catch (err: any) {
      console.error('Error adding user:', err);
      // Intentar extraer más detalles del error
      let errorMessage = 'Error al agregar el usuario';
      
      if (err.response && err.response.data) {
        // Datos de error de Axios
        const errorData = err.response.data;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else if (err.message) {
        // Error estándar de JavaScript
        errorMessage = err.message;
      }
      
      setError(`${errorMessage}\n\nReintentar`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!editingUser) return;
    
    try {
      setLoading(true);
      
      // Asegurarse de que el RUT esté formateado correctamente
      if (data.rut) {
        data.rut = formatRut(data.rut.replace(/\./g, '').replace(/-/g, ''));
      }
      
      console.log('Enviando datos de usuario actualizados:', data);
      
      // Enviar datos actualizados al servidor
      await adminService.updateUser(editingUser.id, data);
      setIsEditDialogOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      console.error('Error updating user:', err);
      
      // Intentar extraer más detalles del error
      let errorMessage = 'Error al actualizar el usuario';
      
      if (err.response && err.response.data) {
        // Datos de error de Axios
        const errorData = err.response.data;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else if (err.message) {
        // Error estándar de JavaScript
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Estado para rastrear usuarios que están siendo eliminados
  const [deletingUsers, setDeletingUsers] = useState<{[id: string]: boolean}>({});
  
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    // Marcar este usuario como "en proceso de eliminación"
    setDeletingUsers(prev => ({...prev, [deleteUserId]: true}));
    
    // Actualización optimista de la UI - Remover visualmente el usuario del estado inmediatamente
    setUsers(currentUsers => currentUsers.filter(user => user.id !== deleteUserId));
    
    try {
      console.log(`Iniciando eliminación del usuario ${deleteUserId}...`);
      
      // Intentar eliminar el usuario (hasta 3 intentos)
      let success = false;
      let attempts = 0;
      let lastError = null;
      
      while (!success && attempts < 3) {
        attempts++;
        try {
          await adminService.deleteUser(deleteUserId);
          success = true;
          console.log(`Usuario eliminado con éxito en el intento ${attempts}`);
        } catch (error) {
          lastError = error;
          console.error(`Error en intento ${attempts}:`, error);
          // Esperar antes del siguiente intento
          if (attempts < 3) await new Promise(r => setTimeout(r, 500));
        }
      }
      
      if (!success) {
        throw lastError || new Error('No se pudo eliminar el usuario después de 3 intentos');
      }
      
      // Notificar éxito al usuario (toast)
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
      toast.innerHTML = 'Usuario eliminado con éxito';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      
      // Mostrar error
      setError('Error al eliminar el usuario. Por favor, intenta de nuevo.');
      
      // Restaurar el usuario en la UI
      fetchUsers().catch(e => console.error('Error recargando usuarios:', e));
    } finally {
      // Eliminar el usuario de la lista de "en proceso de eliminación"
      setDeletingUsers(prev => {
        const newState = {...prev};
        delete newState[deleteUserId];
        return newState;
      });
      
      setDeleteUserId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    return fullName.includes(searchLower) || 
           (user.name?.toLowerCase().includes(searchLower)) ||
           user.email.toLowerCase().includes(searchLower) ||
           user.role.toLowerCase().includes(searchLower);
  });

  // Ya no usamos datos de muestra

  if (loading && users.length === 0) {
    return <Loader />;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>{error}</p>
          <div className="flex gap-3 mt-3">
            <button 
              className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
              onClick={fetchUsers}
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            className="pl-10 w-full sm:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="self-start">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddUser)}>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <Input {...register('firstName')} />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Apellido *</label>
                    <Input {...register('lastName')} />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">RUT</label>
                    <Input {...register('rut')} placeholder="12.345.678-9" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <Input
                      {...register('phone')}
                      placeholder="+56 9 1234 5678"
                      onChange={(e) => {
                        let value = e.target.value;
                        if (!value.startsWith('+56')) {
                          value = '+56' + value.replace(/^0+/, ''); // elimina ceros iniciales si los hay
                        }
                        setValue('phone', value);
                      }}
                    />

                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                    <Input type="date" {...register('birthday')} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección</label>
                  <Input {...register('address')} placeholder="Calle, número, comuna, ciudad" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">URL de Imagen de Perfil</label>
                  <Input {...register('profileImage')} placeholder="https://example.com/image.jpg" />
                  <p className="text-xs text-gray-500 mt-1">La imagen será revisada por el equipo de soporte antes de ser aprobada.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Contraseña *</label>
                  <Input type="password" {...register('password')} />
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Rol *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register('role')}
                  >
                    <option value="customer">Cliente</option>
                    <option value="restaurant_admin">Administrador de Restaurante</option>
                    <option value="delivery_person">Repartidor</option>
                    <option value="admin">Administrador</option>
                    <option value="super_admin">Super Administrador</option>
                  </select>
                  {errors.role && (
                    <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RUT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${deletingUsers[user.id] ? 'opacity-40' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.name || 'N/A'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.rut ? formatRut(user.rut) : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {translateRole(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {deletingUsers[user.id] ? (
                        <span className="inline-flex items-center text-gray-500">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Eliminando...
                        </span>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no puede deshacerse. Se eliminará el usuario permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => {
                                    setDeleteUserId(user.id);
                                    handleDeleteUser();
                                  }}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody> 
          </table>
        </div>
      </div>

      {/* Dialog para editar usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditUser)}>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <Input {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido *</label>
                  <Input {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RUT</label>
                  <Input 
                    {...register('rut')} 
                    placeholder="12.345.678-9"
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\./g, '').replace(/-/g, '');
                      const formattedValue = formatRut(rawValue);
                      setValue('rut', formattedValue);
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <Input {...register('phone')} placeholder="+56 9 1234 5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                  <Input type="date" {...register('birthday')} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <Input {...register('address')} placeholder="Calle, número, comuna, ciudad" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">URL de Imagen de Perfil</label>
                <Input {...register('profileImage')} placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-gray-500 mt-1">La imagen será revisada por el equipo de soporte antes de ser aprobada.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña (Dejar vacío para no cambiar)</label>
                <Input type="password" {...register('password')} />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Rol *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('role')}
                >
                  <option value="customer">Cliente</option>
                  <option value="restaurant_admin">Administrador de Restaurante</option>
                  <option value="delivery_person">Repartidor</option>
                  <option value="admin">Administrador</option>
                  <option value="super_admin">Super Administrador</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                )}
              </div>
              
              {editingUser?.profileImage && (
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm font-medium">Imagen de perfil actual:</p>
                  <img 
                    src={editingUser.profileImage} 
                    alt="Imagen de perfil" 
                    className="w-32 h-32 object-cover rounded-full border border-gray-200"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="imageApproved"
                      {...register('imageApproved')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="imageApproved" className="text-sm text-gray-700">
                      Aprobar imagen
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement; 