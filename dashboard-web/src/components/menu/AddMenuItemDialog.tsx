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
} from '@/components/common/dialog';
import { Input } from '@/components/common/input';
import { Button } from '@/components/common/button';
import { Label } from '@/components/common/label';
import { Textarea } from '@/components/common/textarea';
import { Switch } from '@/components/common/switch';
import { ImagePlus } from 'lucide-react';

interface AddMenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMenuItem: (menuItemData: {
    name: string;
    description: string;
    price: number;
    discountedPrice?: number;
    imageUrl?: string;
    isAvailable: boolean;
    isFeatured: boolean;
  }) => void;
}

const AddMenuItemDialog: React.FC<AddMenuItemDialogProps> = ({
  open,
  onOpenChange,
  onAddMenuItem,
}) => {
  const dict = useDictionary();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = dict.menu.nameRequired;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = dict.menu.validPriceRequired;
    }
    
    if (discountedPrice && (isNaN(Number(discountedPrice)) || Number(discountedPrice) <= 0)) {
      newErrors.discountedPrice = dict.menu.validDiscountedPriceRequired;
    }
    
    if (discountedPrice && Number(discountedPrice) >= Number(price)) {
      newErrors.discountedPrice = dict.menu.discountedPriceLower;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For real implementation, you'd upload this to a server
    // For now, we'll just create a URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // In a real implementation, you'd set imageUrl to the URL returned from the server
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onAddMenuItem({
        name,
        description,
        price: Number(price),
        discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
        imageUrl: imageUrl || undefined,
        isAvailable,
        isFeatured,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setDiscountedPrice('');
      setImageUrl('');
      setImagePreview(null);
      setIsAvailable(true);
      setIsFeatured(false);
      setErrors({});
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding menu item:', error);
      setErrors({ submit: dict.menu.errorAddingItem });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dict.menu.addMenuItem}</DialogTitle>
            <DialogDescription>
              {dict.menu.addMenuItemDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center justify-between">
                {dict.menu.itemName}
                <span className="text-sm text-gray-500">
                  {dict.menu.required}
                </span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={dict.menu.itemNamePlaceholder}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">
                {dict.menu.itemDescription}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={dict.menu.itemDescriptionPlaceholder}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price" className="flex items-center justify-between">
                  {dict.menu.price}
                  <span className="text-sm text-gray-500">
                    {dict.menu.required}
                  </span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="discountedPrice">
                  {dict.menu.discountedPrice}
                </Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                  placeholder="0.00"
                  className={errors.discountedPrice ? 'border-red-500' : ''}
                />
                {errors.discountedPrice && (
                  <p className="text-xs text-red-500">{errors.discountedPrice}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="image">
                {dict.menu.itemImage}
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt={name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {dict.menu.imageDescription}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isAvailable">
                  {dict.menu.isAvailable}
                </Label>
                <Switch
                  id="isAvailable"
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">
                  {dict.menu.isFeatured}
                </Label>
                <Switch
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
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

export default AddMenuItemDialog;