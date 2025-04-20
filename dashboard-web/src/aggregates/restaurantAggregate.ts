import { Restaurant } from '../types/restaurant';
import { RestaurantCreatedEvent, RestaurantUpdatedEvent, MenuItemAddedEvent, MenuItemUpdatedEvent, MenuItemRemovedEvent, MenuCategoryAddedEvent, MenuCategoryUpdatedEvent, MenuCategoryRemovedEvent } from '../events/restaurantEvents';

export class RestaurantAggregate {
  private id: string;
  private name: string;
  private address: string;
  private phone: string;
  private email: string;
  private logo?: string;
  private description?: string;
  private categories: Array<{
    id: string;
    name: string;
    description?: string;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      image?: string;
      available: boolean;
    }>;
  }>;
  private isActive: boolean;
  private version: number;

  constructor() {
    this.id = '';
    this.name = '';
    this.address = '';
    this.phone = '';
    this.email = '';
    this.categories = [];
    this.isActive = false;
    this.version = 0;
  }

  public applyEvent(event: any): void {
    if (event.type === 'RestaurantCreatedEvent') {
      this.applyRestaurantCreatedEvent(event);
    } else if (event.type === 'RestaurantUpdatedEvent') {
      this.applyRestaurantUpdatedEvent(event);
    } else if (event.type === 'MenuItemAddedEvent') {
      this.applyMenuItemAddedEvent(event);
    } else if (event.type === 'MenuItemUpdatedEvent') {
      this.applyMenuItemUpdatedEvent(event);
    } else if (event.type === 'MenuItemRemovedEvent') {
      this.applyMenuItemRemovedEvent(event);
    } else if (event.type === 'MenuCategoryAddedEvent') {
      this.applyMenuCategoryAddedEvent(event);
    } else if (event.type === 'MenuCategoryUpdatedEvent') {
      this.applyMenuCategoryUpdatedEvent(event);
    } else if (event.type === 'MenuCategoryRemovedEvent') {
      this.applyMenuCategoryRemovedEvent(event);
    }
    this.version++;
  }

  private applyRestaurantCreatedEvent(event: RestaurantCreatedEvent): void {
    this.id = event.data.id;
    this.name = event.data.name;
    this.address = event.data.address;
    this.phone = event.data.phone;
    this.email = event.data.email;
    this.logo = event.data.logo;
    this.description = event.data.description;
    this.categories = [];
    this.isActive = true;
  }

  private applyRestaurantUpdatedEvent(event: RestaurantUpdatedEvent): void {
    this.name = event.data.name || this.name;
    this.address = event.data.address || this.address;
    this.phone = event.data.phone || this.phone;
    this.email = event.data.email || this.email;
    this.logo = event.data.logo || this.logo;
    this.description = event.data.description || this.description;
    this.isActive = event.data.isActive !== undefined ? event.data.isActive : this.isActive;
  }

  private applyMenuCategoryAddedEvent(event: MenuCategoryAddedEvent): void {
    this.categories.push({
      id: event.data.categoryId,
      name: event.data.name,
      description: event.data.description,
      items: []
    });
  }

  private applyMenuCategoryUpdatedEvent(event: MenuCategoryUpdatedEvent): void {
    const category = this.categories.find(c => c.id === event.data.categoryId);
    if (category) {
      category.name = event.data.name || category.name;
      category.description = event.data.description || category.description;
    }
  }

  private applyMenuCategoryRemovedEvent(event: MenuCategoryRemovedEvent): void {
    this.categories = this.categories.filter(c => c.id !== event.data.categoryId);
  }

  private applyMenuItemAddedEvent(event: MenuItemAddedEvent): void {
    const category = this.categories.find(c => c.id === event.data.categoryId);
    if (category) {
      category.items.push({
        id: event.data.itemId,
        name: event.data.name,
        description: event.data.description,
        price: event.data.price,
        image: event.data.image,
        available: event.data.available || true
      });
    }
  }

  private applyMenuItemUpdatedEvent(event: MenuItemUpdatedEvent): void {
    const category = this.categories.find(c => c.id === event.data.categoryId);
    if (category) {
      const item = category.items.find(i => i.id === event.data.itemId);
      if (item) {
        item.name = event.data.name || item.name;
        item.description = event.data.description || item.description;
        item.price = event.data.price || item.price;
        item.image = event.data.image || item.image;
        item.available = event.data.available !== undefined ? event.data.available : item.available;
      }
    }
  }

  private applyMenuItemRemovedEvent(event: MenuItemRemovedEvent): void {
    const category = this.categories.find(c => c.id === event.data.categoryId);
    if (category) {
      category.items = category.items.filter(i => i.id !== event.data.itemId);
    }
  }

  public getState(): Restaurant {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      phone: this.phone,
      email: this.email,
      logo: this.logo,
      description: this.description,
      categories: this.categories,
      isActive: this.isActive,
      version: this.version
    };
  }
}
