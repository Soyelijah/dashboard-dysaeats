'use client';

import { useState } from 'react';
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

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  onCategoryAdded: () => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  open,
  onOpenChange,
  restaurantId,
  onCategoryAdded
}) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      restaurant_id: restaurantId,
    }
  });

  const handleAddCategory = async (data: CategoryFormData) => {
    try {
      setLoading(true);
      console.log('Datos para crear categoría:', data);
      await supabaseService.createMenuCategory(data);
      reset();
      onOpenChange(false);
      onCategoryAdded();
    } catch (err: any) {
      console.error('Error adding category:', err);
      alert('Error al agregar categoría: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nueva Categoría</DialogTitle>
          <DialogDescription>
            Ingresa los detalles de la nueva categoría para el menú.
          </DialogDescription>
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

export default AddCategoryDialog;