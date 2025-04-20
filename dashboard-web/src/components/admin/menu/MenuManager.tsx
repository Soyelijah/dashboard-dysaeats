'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabase';
import { Pencil, Trash2, Plus, Menu as MenuIcon, ShoppingBag } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { Button } from '@/components/common/button';
import AddCategoryDialog from './AddCategoryDialog';
import EditCategoryDialog from './EditCategoryDialog';
import AddMenuItemDialog from './AddMenuItemDialog';
import EditMenuItemDialog from './EditMenuItemDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

// Función para formatear precios en formato chileno (separador de miles con punto)
const formatChileanPrice = (price: number): string => {
  // Redondear a entero y formatear con separadores de miles usando punto
  return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

interface Category {
  id: string;
  name: string;
  description?: string;
  restaurant_id: string;
  restaurantId?: string;
}

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

interface Restaurant {
  id: string;
  name: string;
}

interface MenuManagerProps {
  restaurantId?: string;
}

const MenuManager: React.FC<MenuManagerProps> = ({ restaurantId }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen] = useState(false);
  const [isEditMenuItemDialogOpen, setIsEditMenuItemDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [isDeleteMenuItemDialogOpen, setIsDeleteMenuItemDialogOpen] = useState(false);
  
  // Current item states
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteMenuItemId, setDeleteMenuItemId] = useState<string | null>(null);
  
  // Edición de categoría
  const [currentCategoryToEdit, setCurrentCategoryToEdit] = useState<Category | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  
  // Deletion loading states
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [deletingMenuItem, setDeletingMenuItem] = useState(false);

  useEffect(() => {
    // Cargar datos reales del backend
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      setSelectedRestaurantId(restaurantId);
    } else if (restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurantId, restaurants, selectedRestaurantId]);

  useEffect(() => {
    if (selectedRestaurantId) {
      // Cargar categorías y elementos del menú para el restaurante seleccionado
      fetchCategories(selectedRestaurantId);
      fetchMenuItems(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getRestaurants();
      setRestaurants(data);
      
      // Set selected restaurant if provided via props or use the first one
      if (restaurantId) {
        setSelectedRestaurantId(restaurantId);
      } else if (data.length > 0) {
        setSelectedRestaurantId(data[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      setError('Error al cargar los restaurantes: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (restaurantId: string) => {
    try {
      const data = await supabaseService.getMenuCategories(restaurantId);
      console.log('Categorías obtenidas de Supabase:', data);
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Error al cargar las categorías: ' + (err.message || 'Error desconocido'));
    }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const data = await supabaseService.getMenuItems(undefined, restaurantId);
      console.log('Elementos de menú obtenidos de Supabase:', data);
      setMenuItems(data);
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      setError('Error al cargar los elementos del menú: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    
    try {
      setDeletingCategory(true);
      // Llamar al servicio de Supabase para eliminar la categoría
      await supabaseService.deleteMenuCategory(deleteCategoryId);
      
      // Actualizar localmente los datos
      setCategories(prev => prev.filter(cat => cat.id !== deleteCategoryId));
      
      // También actualizar los elementos del menú que tenían esta categoría
      setMenuItems(prev => prev.map(item => {
        if (item.categoryId === deleteCategoryId || item.category_id === deleteCategoryId) {
          return { ...item, categoryId: undefined, category_id: undefined };
        }
        return item;
      }));
      
      setIsDeleteCategoryDialogOpen(false);
      setDeleteCategoryId(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError('Error al eliminar la categoría: ' + (err.message || 'Error desconocido'));
    } finally {
      setDeletingCategory(false);
    }
  };

  const handleDeleteMenuItem = async () => {
    if (!deleteMenuItemId) return;
    
    try {
      setDeletingMenuItem(true);
      // Llamar al servicio de Supabase para eliminar el elemento
      await supabaseService.deleteMenuItem(deleteMenuItemId);
      
      // Eliminar localmente de los datos en memoria
      setMenuItems(prev => prev.filter(item => item.id !== deleteMenuItemId));
      
      setIsDeleteMenuItemDialogOpen(false);
      setDeleteMenuItemId(null);
    } catch (err: any) {
      console.error('Error deleting menu item:', err);
      setError('Error al eliminar el elemento del menú: ' + (err.message || 'Error desconocido'));
    } finally {
      setDeletingMenuItem(false);
    }
  };

  const refreshData = async () => {
    console.log('Refrescando datos...');
    if (selectedRestaurantId) {
      try {
        console.log('Recargando categorías y elementos para restaurante:', selectedRestaurantId);
        setLoading(true);
        setError(null); // Limpiar errores previos
        
        // Recargar los datos de Supabase
        try {
          // Primero cargar las categorías
          await fetchCategories(selectedRestaurantId);
          console.log('Categorías recargadas correctamente');
          
          // Luego cargar los elementos del menú
          await fetchMenuItems(selectedRestaurantId);
          console.log('Elementos del menú recargados correctamente');
          
          // Mostrar un mensaje en consola para verificación
          console.log('Datos refrescados correctamente');
        } catch (err: any) {
          console.error('Error al recargar datos:', err);
          setError('Error al recargar los datos: ' + (err.message || 'Error desconocido'));
        } finally {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error en refreshData:', err);
        setLoading(false);
        setError('Error al refrescar los datos: ' + (err.message || 'Error desconocido'));
      }
    } else {
      console.warn('No se puede refrescar sin un restaurante seleccionado');
    }
  };


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
              onClick={refreshData}
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Restaurant Selector (only show if not provided via props) */}
      {!restaurantId && (
        <div className="mb-6">
          <label htmlFor="restaurant-select" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Restaurante
          </label>
          <select
            id="restaurant-select"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
          >
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200 mb-8">
        <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center">
            <MenuIcon className="h-5 w-5 mr-2 text-primary-500" />
            Categorías del Menú
          </h3>
          <Button 
            onClick={() => setIsAddCategoryDialogOpen(true)}
            disabled={!selectedRestaurantId}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Categoría
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Elementos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {category.description || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {menuItems.filter(item => 
                        item.categoryId === category.id || item.category_id === category.id
                      ).length} elementos
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentCategoryToEdit(category);
                          setIsEditCategoryDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setDeleteCategoryId(category.id);
                          setIsDeleteCategoryDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay categorías. Añade una nueva categoría para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-primary-500" />
            Elementos del Menú
          </h3>
          <Button 
            onClick={() => setIsAddMenuItemDialogOpen(true)}
            disabled={!selectedRestaurantId || categories.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Elemento
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
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
              {menuItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.imageUrl || item.image ? (
                        <img 
                          src={item.imageUrl || item.image} 
                          alt={item.name} 
                          className="h-10 w-10 rounded-md mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                          <ShoppingBag className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {(() => {
                        const catId = item.categoryId || item.category_id;
                        console.log(`MenuItem ${item.id} - categoryId: ${item.categoryId}, category_id: ${item.category_id}, usando: ${catId}`);
                        return categories.find(cat => cat.id === catId)?.name || 'Sin categoría';
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      ${formatChileanPrice(typeof item.price === 'number' 
                        ? item.price 
                        : parseFloat(item.price) || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.isAvailable === false || item.available === false
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.isAvailable === false || item.available === false ? 'No disponible' : 'Disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentMenuItem(item);
                          setIsEditMenuItemDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setDeleteMenuItemId(item.id);
                          setIsDeleteMenuItemDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {menuItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay elementos en el menú. Añade un nuevo elemento para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <AddCategoryDialog 
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        restaurantId={selectedRestaurantId}
        onCategoryAdded={refreshData}
      />
      
      <EditCategoryDialog
        open={isEditCategoryDialogOpen}
        onOpenChange={setIsEditCategoryDialogOpen}
        category={currentCategoryToEdit}
        onCategoryUpdated={refreshData}
      />

      <AddMenuItemDialog 
        open={isAddMenuItemDialogOpen}
        onOpenChange={setIsAddMenuItemDialogOpen}
        restaurantId={selectedRestaurantId}
        categories={categories}
        onMenuItemAdded={refreshData}
      />

      <EditMenuItemDialog 
        open={isEditMenuItemDialogOpen}
        onOpenChange={setIsEditMenuItemDialogOpen}
        menuItem={currentMenuItem}
        categories={categories}
        onMenuItemUpdated={refreshData}
      />

      <DeleteConfirmDialog 
        open={isDeleteCategoryDialogOpen}
        onOpenChange={setIsDeleteCategoryDialogOpen}
        title="¿Eliminar categoría?"
        description="Esta acción no puede deshacerse. Los elementos asociados a esta categoría quedarán sin categoría."
        onConfirm={handleDeleteCategory}
        loading={deletingCategory}
      />

      <DeleteConfirmDialog 
        open={isDeleteMenuItemDialogOpen}
        onOpenChange={setIsDeleteMenuItemDialogOpen}
        title="¿Eliminar elemento del menú?"
        description="Esta acción no puede deshacerse. El elemento será eliminado permanentemente."
        onConfirm={handleDeleteMenuItem}
        loading={deletingMenuItem}
      />
    </div>
  );
};

export default MenuManager;