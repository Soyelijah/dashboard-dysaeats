'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/common/dialog';
import { Input } from '@/components/common/form-input';
import { Button } from '@/components/common/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const menuItemFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  image: z.string().optional().or(z.literal('')),
  available: z.boolean().default(true),
  category_id: z.string().min(1, 'La categoría es requerida'),
  restaurant_id: z.string().min(1, 'El restaurante es requerido'),
});

type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string;
  image?: string;
  isAvailable?: boolean;
  available?: boolean;
  categoryId?: string;
  category_id?: string;
  restaurantId?: string;
  restaurant_id?: string;
}

interface MenuCategory {
  id: string;
  name: string;
}

interface EditMenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: MenuItem | null;
  categories: MenuCategory[];
  onMenuItemUpdated: () => void;
}

const EditMenuItemDialog: React.FC<EditMenuItemDialogProps> = ({
  open,
  onOpenChange,
  menuItem,
  categories,
  onMenuItemUpdated
}) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      available: true,
    }
  });

  useEffect(() => {
    if (menuItem) {
      console.log('Datos de elemento de menú a editar:', menuItem);
      
      // Establecer valores en el formulario con manejo de diferentes nombres de propiedades
      setValue('name', menuItem.name);
      setValue('description', menuItem.description || '');
      
      // Precio: podría ser un número o una cadena
      const price = typeof menuItem.price === 'number' 
        ? menuItem.price 
        : parseFloat(menuItem.price) || 0;
      setValue('price', price);
      
      // URL de imagen: podría estar en imageUrl o image
      setValue('image', menuItem.imageUrl || menuItem.image || '');
      
      // Disponibilidad: podría estar en isAvailable o available
      const available = menuItem.isAvailable !== undefined 
        ? menuItem.isAvailable 
        : (menuItem.available !== undefined ? menuItem.available : true);
      setValue('available', available);
      
      // ID de categoría: podría estar en categoryId o category_id
      setValue('category_id', menuItem.categoryId || menuItem.category_id || '');
      
      // ID de restaurante: podría estar en restaurantId o restaurant_id
      setValue('restaurant_id', menuItem.restaurantId || menuItem.restaurant_id || '');
    }
  }, [menuItem, setValue]);

  const handleUpdateMenuItem = async (data: MenuItemFormData) => {
    if (!menuItem) return;
    
    try {
      setLoading(true);
      
      console.log('Elemento original:', menuItem);
      console.log('Datos del formulario:', data);
      console.log('Actualizando elemento de menú con datos a Supabase:', data);
      
      // Mostrar en consola la categoría seleccionada para depuración
      console.log(`Categoría seleccionada: ID=${data.category_id}, Nombre=${categories.find(c => c.id === data.category_id)?.name || 'No encontrada'}`);
      
      // Llamar al servicio de Supabase para actualizar el elemento
      const result = await supabaseService.updateMenuItem(menuItem.id, data);
      console.log('Resultado de la actualización en Supabase:', result);
      
      // Cerrar el diálogo y notificar que se actualizó el elemento
      onOpenChange(false);
      
      // Dar un poco de tiempo antes de intentar actualizar la UI
      setTimeout(() => {
        onMenuItemUpdated();
      }, 300);
    } catch (err: any) {
      console.error('Error updating menu item:', err);
      alert('Error al actualizar elemento de menú: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (!menuItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Elemento de Menú</DialogTitle>
          <DialogDescription>
            Modifica los detalles del elemento de menú y guarda los cambios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleUpdateMenuItem)}>
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
                <label className="block text-sm font-medium mb-1">Precio *</label>
                <Input type="number" step="0.01" {...register('price')} />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('category_id')}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.category_id.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">URL de Imagen</label>
              <Input {...register('image')} placeholder="https://ejemplo.com/imagen.jpg" />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="availableEdit"
                className="mr-2"
                {...register('available')}
              />
              <label htmlFor="availableEdit" className="text-sm font-medium">
                Disponible
              </label>
            </div>
            
            <input type="hidden" {...register('restaurant_id')} />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMenuItemDialog;