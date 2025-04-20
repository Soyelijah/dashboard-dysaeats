'use client';

import React, { useState, useEffect } from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import { useToast } from '@/hooks/useToast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Switch } from '@/components/common/switch';
import { Badge } from '@/components/common/badge';
import { Trash2, Edit, MenuSquare, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import AddCategoryDialog from './AddCategoryDialog';
import AddMenuItemDialog from './AddMenuItemDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { v4 as uuidv4 } from 'uuid';

// Types definition
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  items: MenuItem[];
}

const DraggableMenuManager: React.FC = () => {
  const dict = useDictionary();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ categoryId: string, itemId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch menu data on component mount
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        const mockCategories: Category[] = [
          {
            id: 'category-1',
            name: 'Hamburguesas',
            description: 'Deliciosas hamburguesas con carne 100% de res',
            isActive: true,
            items: [
              {
                id: 'item-1',
                name: 'Hamburguesa Clásica',
                description: 'Carne de res, lechuga, tomate, cebolla y queso',
                price: 8.99,
                imageUrl: 'https://images.unsplash.com/photo-1550317138-10000687a72b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                isAvailable: true,
                isFeatured: true,
              },
              {
                id: 'item-2',
                name: 'Hamburguesa con Tocino',
                description: 'Carne de res, tocino crujiente, queso cheddar y salsa BBQ',
                price: 10.99,
                imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                isAvailable: true,
                isFeatured: false,
              },
            ],
          },
          {
            id: 'category-2',
            name: 'Pizzas',
            description: 'Pizzas artesanales horneadas en horno de piedra',
            isActive: true,
            items: [
              {
                id: 'item-3',
                name: 'Pizza Margherita',
                description: 'Salsa de tomate, mozzarella fresca y albahaca',
                price: 12.99,
                imageUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                isAvailable: true,
                isFeatured: true,
              },
              {
                id: 'item-4',
                name: 'Pizza Pepperoni',
                description: 'Salsa de tomate, queso mozzarella y pepperoni',
                price: 14.99,
                discountedPrice: 12.99,
                imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                isAvailable: true,
                isFeatured: false,
              },
            ],
          },
          {
            id: 'category-3',
            name: 'Bebidas',
            description: 'Refrescantes bebidas para acompañar tu comida',
            isActive: false,
            items: [
              {
                id: 'item-5',
                name: 'Refresco de Cola',
                description: 'Refresco de cola con hielo',
                price: 2.99,
                isAvailable: true,
                isFeatured: false,
              },
              {
                id: 'item-6',
                name: 'Limonada Natural',
                description: 'Limonada recién exprimida con hierbabuena',
                price: 3.99,
                isAvailable: false,
                isFeatured: false,
              },
            ],
          },
        ];
        
        setCategories(mockCategories);
        
        // Default to expanding the first category
        if (mockCategories.length > 0) {
          setExpandedCategories({ [mockCategories[0].id]: true });
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
        toast({
          title: dict.menu.errorTitle,
          description: dict.menu.errorFetchingMenu,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuData();
  }, [dict, toast]);

  // Handle category expansion toggle
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Handle add category
  const handleAddCategory = async (categoryData: {
    name: string;
    description: string;
    isActive: boolean;
  }) => {
    const newCategory: Category = {
      id: `category-${uuidv4()}`,
      ...categoryData,
      items: [],
    };
    
    setCategories((prev) => [...prev, newCategory]);
    setExpandedCategories((prev) => ({
      ...prev,
      [newCategory.id]: true,
    }));
    
    toast({
      title: dict.menu.success,
      description: dict.menu.categoryAdded,
    });
    
    // In a real implementation, this would be an API call to save the new category
  };

  // Handle add menu item
  const handleAddMenuItem = async (menuItemData: {
    name: string;
    description: string;
    price: number;
    discountedPrice?: number;
    imageUrl?: string;
    isAvailable: boolean;
    isFeatured: boolean;
  }) => {
    if (!currentCategoryId) return;
    
    const newItem: MenuItem = {
      id: `item-${uuidv4()}`,
      ...menuItemData,
    };
    
    setCategories((prev) =>
      prev.map((category) =>
        category.id === currentCategoryId
          ? { ...category, items: [...category.items, newItem] }
          : category
      )
    );
    
    toast({
      title: dict.menu.success,
      description: dict.menu.menuItemAdded,
    });
    
    // In a real implementation, this would be an API call to save the new menu item
  };

  // Handle update category (e.g., toggling active state)
  const onUpdateCategory = (categoryId: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, ...updates }
          : category
      )
    );
    
    // In a real implementation, this would be an API call to update the category
  };

  // Handle delete category
  const handleDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setItemToDelete(null);
    setDeleteDialogOpen(true);
  };

  // Handle delete menu item
  const handleDeleteMenuItem = (categoryId: string, itemId: string) => {
    setItemToDelete({ categoryId, itemId });
    setCategoryToDelete(null);
    setDeleteDialogOpen(true);
  };

  // Confirm delete category
  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    
    setCategories((prev) =>
      prev.filter((category) => category.id !== categoryToDelete)
    );
    
    toast({
      title: dict.menu.success,
      description: dict.menu.categoryDeleted,
    });
    
    setCategoryToDelete(null);
    
    // In a real implementation, this would be an API call to delete the category
  };

  // Confirm delete menu item
  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    
    const { categoryId, itemId } = itemToDelete;
    
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter((item) => item.id !== itemId),
            }
          : category
      )
    );
    
    toast({
      title: dict.menu.success,
      description: dict.menu.menuItemDeleted,
    });
    
    setItemToDelete(null);
    
    // In a real implementation, this would be an API call to delete the menu item
  };

  // Handle drag and drop
  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;
    
    // If dropped outside a droppable area or no movement
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Handle category reordering
    if (type === 'category') {
      const reorderedCategories = Array.from(categories);
      const [movedCategory] = reorderedCategories.splice(source.index, 1);
      reorderedCategories.splice(destination.index, 0, movedCategory);
      
      setCategories(reorderedCategories);
      
      // In a real implementation, this would be an API call to update the category order
      return;
    }
    
    // Handle item reordering within the same category
    if (source.droppableId === destination.droppableId) {
      const categoryIndex = categories.findIndex(
        (category) => category.id === source.droppableId
      );
      
      if (categoryIndex === -1) return;
      
      const categoryItems = Array.from(categories[categoryIndex].items);
      const [movedItem] = categoryItems.splice(source.index, 1);
      categoryItems.splice(destination.index, 0, movedItem);
      
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex] = {
        ...categories[categoryIndex],
        items: categoryItems,
      };
      
      setCategories(updatedCategories);
      
      // In a real implementation, this would be an API call to update the item order
      return;
    }
    
    // Handle item movement between categories
    const sourceCategoryIndex = categories.findIndex(
      (category) => category.id === source.droppableId
    );
    const destCategoryIndex = categories.findIndex(
      (category) => category.id === destination.droppableId
    );
    
    if (sourceCategoryIndex === -1 || destCategoryIndex === -1) return;
    
    const sourceItems = Array.from(categories[sourceCategoryIndex].items);
    const destItems = Array.from(categories[destCategoryIndex].items);
    const [movedItem] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, movedItem);
    
    const updatedCategories = [...categories];
    updatedCategories[sourceCategoryIndex] = {
      ...categories[sourceCategoryIndex],
      items: sourceItems,
    };
    updatedCategories[destCategoryIndex] = {
      ...categories[destCategoryIndex],
      items: destItems,
    };
    
    setCategories(updatedCategories);
    
    // In a real implementation, this would be an API call to update the item's category and order
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{dict.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{dict.menu.menuManager}</h2>
        <Button onClick={() => setAddCategoryOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {dict.menu.addCategory}
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="categories" type="category">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {categories.map((category, index) => (
                <Draggable key={category.id} draggableId={category.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="shadow-sm"
                    >
                      <Card>
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps}>
                                <MenuSquare className="h-5 w-5 text-gray-400" />
                              </div>
                              <div>
                                <CardTitle className="flex items-center">
                                  {category.name}
                                  {!category.isActive && (
                                    <Badge variant="outline" className="ml-2">
                                      {dict.menu.inactive}
                                    </Badge>
                                  )}
                                </CardTitle>
                                {category.description && (
                                  <CardDescription>{category.description}</CardDescription>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={category.isActive}
                                onCheckedChange={(checked) => onUpdateCategory(category.id, { isActive: checked })}
                                aria-label={dict.menu.toggleActive}
                              />
                              <Button variant="ghost" size="sm" onClick={() => toggleCategory(category.id)}>
                                {expandedCategories[category.id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentCategoryId(category.id);
                                  setAddItemOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        {expandedCategories[category.id] && (
                          <CardContent className="p-4 pt-0">
                            <Droppable droppableId={category.id} type="item">
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="space-y-2"
                                >
                                  {category.items.length === 0 ? (
                                    <p className="text-gray-500 text-sm py-2">
                                      {dict.menu.noItems}
                                    </p>
                                  ) : (
                                    category.items.map((item, index) => (
                                      <Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={index}
                                      >
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700 flex justify-between items-center"
                                          >
                                            <div className="flex items-center gap-3">
                                              {item.imageUrl && (
                                                <img
                                                  src={item.imageUrl}
                                                  alt={item.name}
                                                  className="h-10 w-10 rounded-md object-cover"
                                                />
                                              )}
                                              <div>
                                                <div className="font-medium flex items-center gap-2">
                                                  {item.name}
                                                  {!item.isAvailable && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {dict.menu.unavailable}
                                                    </Badge>
                                                  )}
                                                  {item.isFeatured && (
                                                    <Badge className="bg-amber-500 text-xs">
                                                      {dict.menu.featured}
                                                    </Badge>
                                                  )}
                                                </div>
                                                {item.description && (
                                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {item.description}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <div className="text-right">
                                                {item.discountedPrice !== undefined && item.discountedPrice < item.price ? (
                                                  <div>
                                                    <span className="line-through text-sm text-gray-500 dark:text-gray-400">
                                                      ${item.price.toFixed(2)}
                                                    </span>
                                                    <span className="ml-2 font-bold text-red-600 dark:text-red-400">
                                                      ${item.discountedPrice.toFixed(2)}
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <span className="font-medium">
                                                    ${item.price.toFixed(2)}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex gap-1">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    // Handle edit item
                                                    // For this implementation, we're not creating the edit functionality
                                                  }}
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleDeleteMenuItem(category.id, item.id)}
                                                >
                                                  <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </CardContent>
                        )}

                        <CardFooter className="flex justify-end p-4 pt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentCategoryId(category.id);
                              setAddItemOpen(true);
                            }}
                          >
                            <Plus className="mr-1 h-4 w-4" /> {dict.menu.addItem}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Dialog for adding category */}
      <AddCategoryDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        onAddCategory={handleAddCategory}
      />

      {/* Dialog for adding menu item */}
      <AddMenuItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        onAddMenuItem={handleAddMenuItem}
      />

      {/* Confirmation dialog for deletion */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={itemToDelete ? dict.menu.deleteItemTitle : dict.menu.deleteCategoryTitle}
        description={itemToDelete ? dict.menu.deleteItemDescription : dict.menu.deleteCategoryDescription}
        onConfirm={itemToDelete ? confirmDeleteItem : confirmDeleteCategory}
      />
    </div>
  );
};

export default DraggableMenuManager;