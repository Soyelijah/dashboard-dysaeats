'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { verifyAuth } from '@/lib/supabase';
import { Pencil, Trash2, Plus, Search, Grip } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/common/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/common/alert-dialog';
import { Input } from '@/components/common/form-input';
import { Button } from '@/components/common/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type Category = {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  image?: string;
  slug?: string;
  isActive: boolean;
  createdAt?: string;
  restaurantId?: string;
};

const categoryFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  displayOrder: z.number().default(0),
  image: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      displayOrder: 0,
      isActive: true
    }
  });

  useEffect(() => {
    // Cargar datos reales del backend
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setValue('name', editingCategory.name);
      setValue('description', editingCategory.description || '');
      setValue('displayOrder', editingCategory.displayOrder);
      setValue('image', editingCategory.image || '');
      setValue('isActive', editingCategory.isActive);
    }
  }, [editingCategory, setValue]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticación primero
      const isAuthenticated = await verifyAuth();
      
      if (!isAuthenticated) {
        setError('Usuario no autenticado. Por favor inicie sesión.');
        return;
      }
      
      // Si está autenticado, cargar las categorías
      // Nota: Este endpoint debería estar implementado en el servicio adminService
      const data = await adminService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (data: CategoryFormData) => {
    try {
      setLoading(true);
      await adminService.createCategory(data);
      setIsAddDialogOpen(false);
      reset();
      await fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Error al agregar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return;
    
    try {
      setLoading(true);
      await adminService.updateCategory(editingCategory.id, data);
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Error al actualizar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    
    try {
      setLoading(true);
      await adminService.deleteCategory(deleteCategoryId);
      setDeleteCategoryId(null);
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Error al eliminar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (category.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDragStart = (event: React.DragEvent<HTMLTableRowElement>, category: Category) => {
    setIsDragging(true);
    setDraggedCategory(category);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', category.id);
    
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    event.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>, category: Category) => {
    event.preventDefault();
    if (!draggedCategory || draggedCategory.id === category.id) return;
    
    const draggedIndex = categories.findIndex(c => c.id === draggedCategory.id);
    const hoverIndex = categories.findIndex(c => c.id === category.id);
    
    if (draggedIndex === hoverIndex) return;
    
    // Reorder the categories array
    const newCategories = [...categories];
    const [removedCategory] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(hoverIndex, 0, removedCategory);
    
    // Update the displayOrder field
    const updatedCategories = newCategories.map((c, index) => ({
      ...c,
      displayOrder: index
    }));
    
    setCategories(updatedCategories);
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    setDraggedCategory(null);
    
    try {
      // Save the new order to the backend
      const updates = categories.map(category => ({
        id: category.id,
        displayOrder: category.displayOrder
      }));
      
      await adminService.updateCategoriesOrder(updates);
    } catch (err) {
      console.error('Error updating categories order:', err);
      setError('Error al actualizar el orden de las categorías');
      await fetchCategories(); // Revert to the original order
    }
  };

  if (loading && categories.length === 0) {
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
              onClick={fetchCategories}
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
            placeholder="Buscar categorías..."
            className="pl-10 w-full sm:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="self-start">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Categoría</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddCategory)}>
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <Input {...register('name')} />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
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
                    <label className="block text-sm font-medium mb-1">Orden de visualización</label>
                    <Input 
                      type="number" 
                      {...register('displayOrder', { valueAsNumber: true })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                    <Input {...register('image')} placeholder="https://example.com/image.jpg" />
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
                    Categoría Activa
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  reset();
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
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
              {filteredCategories.map((category, index) => (
                <tr 
                  key={category.id} 
                  className={`hover:bg-gray-50 ${isDragging && draggedCategory?.id === category.id ? 'opacity-50 bg-gray-100' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, category)}
                  onDragOver={(e) => handleDragOver(e, category)}
                  onDragEnd={handleDragEnd}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Grip className="h-4 w-4 text-gray-400 cursor-move mr-2" />
                      <span className="text-sm text-gray-700">{category.displayOrder}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="h-10 w-10 rounded mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 text-xs">{category.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {category.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
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
                              Esta acción no puede deshacerse. Se eliminará la categoría permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => {
                                setDeleteCategoryId(category.id);
                                handleDeleteCategory();
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
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron categorías.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog para editar categoría */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditCategory)}>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <Input {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
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
                  <label className="block text-sm font-medium mb-1">Orden de visualización</label>
                  <Input 
                    type="number" 
                    {...register('displayOrder', { valueAsNumber: true })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                  <Input {...register('image')} placeholder="https://example.com/image.jpg" />
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
                  Categoría Activa
                </label>
              </div>
              
              {editingCategory?.image && (
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm font-medium">Imagen actual:</p>
                  <img 
                    src={editingCategory.image} 
                    alt="Imagen de categoría" 
                    className="h-40 w-auto object-contain border border-gray-200 rounded"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingCategory(null);
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

export default CategoryManagement;