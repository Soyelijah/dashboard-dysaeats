// Restaurant types for Event Sourcing system
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  description?: string;
  categories: MenuCategory[];
  isActive: boolean;
  version: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  available: boolean;
}

// Restaurant command types
export interface CreateRestaurantCommand {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  description?: string;
}

export interface UpdateRestaurantCommand {
  restaurantId: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
}

export interface AddMenuCategoryCommand {
  restaurantId: string;
  name: string;
  description?: string;
}

export interface UpdateMenuCategoryCommand {
  restaurantId: string;
  categoryId: string;
  name?: string;
  description?: string;
}

export interface RemoveMenuCategoryCommand {
  restaurantId: string;
  categoryId: string;
}

export interface AddMenuItemCommand {
  restaurantId: string;
  categoryId: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface UpdateMenuItemCommand {
  restaurantId: string;
  categoryId: string;
  itemId: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  available?: boolean;
}

export interface RemoveMenuItemCommand {
  restaurantId: string;
  categoryId: string;
  itemId: string;
}
