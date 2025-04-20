'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { verifyAuth } from '@/lib/supabase';
import { Pencil, Trash2, Plus, Search, Clock, MapPin } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/common/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/common/alert-dialog';
import { Input } from '@/components/common/form-input';
import { Button } from '@/components/common/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  openingHours?: string[];
  userId?: string; // Este campo es el que viene del backend
  admin?: {
    id: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
};

const restaurantFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  address: z.string().min(1, 'La dirección es requerida'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  logo: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  // Eliminamos adminId del schema ya que no es aceptado por el backend
  openingHours: z.array(z.string()).optional().default([]),
});

type RestaurantFormData = z.infer<typeof restaurantFormSchema>;

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteRestaurantId, setDeleteRestaurantId] = useState<string | null>(null);
  const [openingHours, setOpeningHours] = useState<string[]>([]);
  const [currentHour, setCurrentHour] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      openingHours: [],
      isActive: true
    }
  });

  useEffect(() => {
    // Cargar datos reales del backend
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (editingRestaurant) {
      setValue('name', editingRestaurant.name);
      setValue('description', editingRestaurant.description || '');
      setValue('address', editingRestaurant.address);
      setValue('phone', editingRestaurant.phone || '');
      setValue('email', editingRestaurant.email || '');
      setValue('website', editingRestaurant.website || '');
      setValue('logo', editingRestaurant.logo || '');
      setValue('isActive', editingRestaurant.isActive);
      // No establecemos adminId ya que no es aceptado por el backend
      setValue('openingHours', editingRestaurant.openingHours || []);
      setOpeningHours(editingRestaurant.openingHours || []);
    }
  }, [editingRestaurant, setValue]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticación primero
      const isAuthenticated = await verifyAuth();
      
      if (!isAuthenticated) {
        setError('Usuario no autenticado. Por favor inicie sesión.');
        return;
      }
      
      // Si está autenticado, cargar los restaurantes
      const data = await adminService.getRestaurants();
      setRestaurants(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Error al cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = async (data: RestaurantFormData) => {
    try {
      setLoading(true);
      // Include the current opening hours in the form data
      data.openingHours = openingHours;
      await adminService.createRestaurant(data);
      setIsAddDialogOpen(false);
      reset();
      setOpeningHours([]);
      await fetchRestaurants();
    } catch (err) {
      console.error('Error adding restaurant:', err);
      setError('Error al agregar el restaurante');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRestaurant = async (data: RestaurantFormData) => {
    if (!editingRestaurant) return;
    
    try {
      setLoading(true);
      // Include the current opening hours in the form data
      data.openingHours = openingHours;
      
      // Eliminar userId y adminId si existen en los datos y mostrar lo que se envía
      console.log('Datos enviados al editar restaurant:', data);
      
      // Eliminar userId y adminId si existen
      if ('userId' in data) {
        delete (data as any).userId;
      }
      
      if ('adminId' in data) {
        delete (data as any).adminId;
      }
      
      console.log('Datos después de limpieza:', data);
      
      await adminService.updateRestaurant(editingRestaurant.id, data);
      setIsEditDialogOpen(false);
      setEditingRestaurant(null);
      setOpeningHours([]);
      await fetchRestaurants();
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError('Error al actualizar el restaurante');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!deleteRestaurantId) return;
    
    try {
      setLoading(true);
      await adminService.deleteRestaurant(deleteRestaurantId);
      setDeleteRestaurantId(null);
      await fetchRestaurants();
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      setError('Error al eliminar el restaurante');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOpeningHour = () => {
    if (currentHour.trim()) {
      setOpeningHours([...openingHours, currentHour.trim()]);
      setCurrentHour('');
    }
  };

  const handleRemoveOpeningHour = (index: number) => {
    const updatedHours = [...openingHours];
    updatedHours.splice(index, 1);
    setOpeningHours(updatedHours);
  };

  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (restaurant.email && restaurant.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  if (loading && restaurants.length === 0) {
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
              onClick={fetchRestaurants}
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
            placeholder="Buscar restaurantes..."
            className="pl-10 w-full sm:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="self-start">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Restaurante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Restaurante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddRestaurant)}>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <Input {...register('name')} />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    {...register('description')}
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Dirección *</label>
                    <Input {...register('address')} />
                    {errors.address && (
                      <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <Input {...register('phone')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Sitio Web</label>
                    <Input {...register('website')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL del Logo</label>
                    <Input {...register('logo')} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Horarios de Atención</label>
                  <div className="flex gap-2 mb-2">
                    <Input 
                      value={currentHour}
                      onChange={(e) => setCurrentHour(e.target.value)}
                      placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddOpeningHour}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {openingHours.map((hour, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{hour}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveOpeningHour(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {openingHours.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No hay horarios agregados</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="mr-2"
                    {...register('isActive')}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Restaurante Activo
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  reset();
                  setOpeningHours([]);
                }}>
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
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {restaurant.logo ? (
                        <img 
                          src={restaurant.logo} 
                          alt={restaurant.name} 
                          className="h-10 w-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 text-xs">{restaurant.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                        {restaurant.website && (
                          <div className="text-xs text-gray-500">
                            <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {restaurant.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{restaurant.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {restaurant.email && <div>{restaurant.email}</div>}
                      {restaurant.phone && <div>{restaurant.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      restaurant.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {restaurant.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingRestaurant(restaurant);
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
                              Esta acción no puede deshacerse. Se eliminará el restaurante permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => {
                                setDeleteRestaurantId(restaurant.id);
                                handleDeleteRestaurant();
                              }}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRestaurants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron restaurantes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog para editar restaurante */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Restaurante</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditRestaurant)}>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <Input {...register('name')} />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  {...register('description')}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección *</label>
                  <Input {...register('address')} />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <Input {...register('phone')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sitio Web</label>
                  <Input {...register('website')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL del Logo</label>
                  <Input {...register('logo')} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horarios de Atención</label>
                <div className="flex gap-2 mb-2">
                  <Input 
                    value={currentHour}
                    onChange={(e) => setCurrentHour(e.target.value)}
                    placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddOpeningHour}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {openingHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{hour}</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveOpeningHour(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {openingHours.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No hay horarios agregados</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  className="mr-2"
                  {...register('isActive')}
                />
                <label htmlFor="isActiveEdit" className="text-sm font-medium">
                  Restaurante Activo
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingRestaurant(null);
                setOpeningHours([]);
              }}>
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

export default RestaurantManagement;