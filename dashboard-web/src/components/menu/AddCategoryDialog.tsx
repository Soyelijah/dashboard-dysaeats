'use client';

import React, { useState } from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/dialog';
import { Input } from '@/components/common/input';
import { Button } from '@/components/common/button';
import { Label } from '@/components/common/label';
import { Textarea } from '@/components/common/textarea';
import { Switch } from '@/components/common/switch';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (categoryData: {
    name: string;
    description: string;
    isActive: boolean;
  }) => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  open,
  onOpenChange,
  onAddCategory,
}) => {
  const dict = useDictionary();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = dict.menu.nameRequired;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onAddCategory({
        name,
        description,
        isActive,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setIsActive(true);
      setErrors({});
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding category:', error);
      setErrors({ submit: dict.menu.errorAddingCategory });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dict.menu.addCategory}</DialogTitle>
            <DialogDescription>
              {dict.menu.addCategoryDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center justify-between">
                {dict.menu.categoryName}
                <span className="text-sm text-gray-500">
                  {dict.menu.required}
                </span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={dict.menu.categoryNamePlaceholder}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">
                {dict.menu.categoryDescription}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={dict.menu.categoryDescriptionPlaceholder}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">
                {dict.menu.isActive}
              </Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
            {errors.submit && (
              <p className="text-xs text-red-500">{errors.submit}</p>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {dict.menu.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? dict.menu.adding : dict.menu.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;