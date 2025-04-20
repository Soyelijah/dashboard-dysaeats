'use client';

import { useState } from 'react';
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

interface MenuCategory {
  id: string;
  name: string;
}

interface AddMenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  categories: MenuCategory[];
  onMenuItemAdded: () => void;
}

const AddMenuItemDialog: React.FC<AddMenuItemDialogProps> = ({
  open,
  onOpenChange,
  restaurantId,
  categories,
  onMenuItemAdded
}) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      available: true,
      restaurant_id: restaurantId,
      category_id: categories.length > 0 ? categories[0].id : '',
    }
  });

  const handleAddMenuItem = async (data: MenuItemFormData) => {
    try {
      setLoading(true);
      console.log('Agregando elemento de menú (datos de formulario):', data);
      
      const result = await supabaseService.createMenuItem(data);
      console.log('Elemento creado en Supabase:', result);
      
      reset();
      onOpenChange(false);
      onMenuItemAdded();
    } catch (err: any) {
      console.error('Error adding menu item:', err);
      alert('Error al agregar elemento de menú: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Elemento de Menú</DialogTitle>
          <DialogDescription>
            Ingresa los detalles del nuevo elemento para el menú.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleAddMenuItem)}>
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
                  {categories.length === 0 && (
                    <option value="">No hay categorías disponibles</option>
                  )}
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
                id="available"
                className="mr-2"
                {...register('available')}
              />
              <label htmlFor="available" className="text-sm font-medium">
                Disponible
              </label>
            </div>
            
            <input type="hidden" {...register('restaurant_id')} value={restaurantId} />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMenuItemDialog;