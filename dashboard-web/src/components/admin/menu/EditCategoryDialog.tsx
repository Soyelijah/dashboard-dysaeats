'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/common/dialog';
import { Input } from '@/components/common/form-input';
import { Button } from '@/components/common/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  restaurant_id: z.string().min(1, 'El restaurante es requerido'),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface Category {
  id: string;
  name: string;
  description?: string;
  restaurant_id: string;
  restaurantId?: string;
}

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onCategoryUpdated: () => void;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
  onCategoryUpdated
}) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
  });

  // Cargar los datos de la categoría cuando cambia
  useEffect(() => {
    if (category) {
      setValue('name', category.name);
      setValue('description', category.description || '');
      setValue('restaurant_id', category.restaurant_id || category.restaurantId || '');
    }
  }, [category, setValue]);

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!category) return;
    
    try {
      setLoading(true);
      console.log('Actualizando categoría con datos:', data);
      
      await supabaseService.updateMenuCategory(category.id, data);
      
      reset();
      onOpenChange(false);
      onCategoryUpdated();
    } catch (err: any) {
      console.error('Error updating category:', err);
      alert('Error al actualizar categoría: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Actualiza los detalles de la categoría del menú.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleUpdateCategory)}>
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
            
            <input type="hidden" {...register('restaurant_id')} />
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
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;