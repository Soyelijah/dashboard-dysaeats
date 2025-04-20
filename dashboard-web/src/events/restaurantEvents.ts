// Restaurant Event Types
export interface BaseEvent {
  type: string;
  aggregateId: string;
  version: number;
  timestamp: number;
  data: any;
}

export interface RestaurantCreatedEvent extends BaseEvent {
  type: 'RestaurantCreatedEvent';
  data: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    description?: string;
  };
}

export interface RestaurantUpdatedEvent extends BaseEvent {
  type: 'RestaurantUpdatedEvent';
  data: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    description?: string;
    isActive?: boolean;
  };
}

export interface MenuCategoryAddedEvent extends BaseEvent {
  type: 'MenuCategoryAddedEvent';
  data: {
    categoryId: string;
    name: string;
    description?: string;
  };
}

export interface MenuCategoryUpdatedEvent extends BaseEvent {
  type: 'MenuCategoryUpdatedEvent';
  data: {
    categoryId: string;
    name?: string;
    description?: string;
  };
}

export interface MenuCategoryRemovedEvent extends BaseEvent {
  type: 'MenuCategoryRemovedEvent';
  data: {
    categoryId: string;
  };
}

export interface MenuItemAddedEvent extends BaseEvent {
  type: 'MenuItemAddedEvent';
  data: {
    categoryId: string;
    itemId: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    available?: boolean;
  };
}

export interface MenuItemUpdatedEvent extends BaseEvent {
  type: 'MenuItemUpdatedEvent';
  data: {
    categoryId: string;
    itemId: string;
    name?: string;
    description?: string;
    price?: number;
    image?: string;
    available?: boolean;
  };
}

export interface MenuItemRemovedEvent extends BaseEvent {
  type: 'MenuItemRemovedEvent';
  data: {
    categoryId: string;
    itemId: string;
  };
}

// Factory functions to create restaurant events
export function createRestaurantCreatedEvent(
  aggregateId: string,
  version: number,
  data: RestaurantCreatedEvent['data']
): RestaurantCreatedEvent {
  return {
    type: 'RestaurantCreatedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createRestaurantUpdatedEvent(
  aggregateId: string,
  version: number,
  data: RestaurantUpdatedEvent['data']
): RestaurantUpdatedEvent {
  return {
    type: 'RestaurantUpdatedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createMenuCategoryAddedEvent(
  aggregateId: string,
  version: number,
  data: MenuCategoryAddedEvent['data']
): MenuCategoryAddedEvent {
  return {
    type: 'MenuCategoryAddedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createMenuCategoryUpdatedEvent(
  aggregateId: string,
  version: number,
  data: MenuCategoryUpdatedEvent['data']
): MenuCategoryUpdatedEvent {
  return {
    type: 'MenuCategoryUpdatedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createMenuCategoryRemovedEvent(
  aggregateId: string,
  version: number,
  data: MenuCategoryRemovedEvent['data']
): MenuCategoryRemovedEvent {
  return {
    type: 'MenuCategoryRemovedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createMenuItemAddedEvent(
  aggregateId: string,
  version: number,
  data: MenuItemAddedEvent['data']
): MenuItemAddedEvent {
  return {
    type: 'MenuItemAddedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createMenuItemUpdatedEvent(
  aggregateId: string,
  version: number,
  data: MenuItemUpdatedEvent['data']
): MenuItemUpdatedEvent {
  return {
    type: 'MenuItemUpdatedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}

export function createMenuItemRemovedEvent(
  aggregateId: string,
  version: number,
  data: MenuItemRemovedEvent['data']
): MenuItemRemovedEvent {
  return {
    type: 'MenuItemRemovedEvent',
    aggregateId,
    version,
    timestamp: Date.now(),
    data
  };
}
