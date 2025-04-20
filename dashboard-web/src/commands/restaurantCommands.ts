import { v4 as uuidv4 } from 'uuid';
import { RestaurantAggregate } from '../aggregates/restaurantAggregate';
import {
  createRestaurantCreatedEvent,
  createRestaurantUpdatedEvent,
  createMenuCategoryAddedEvent,
  createMenuCategoryUpdatedEvent,
  createMenuCategoryRemovedEvent,
  createMenuItemAddedEvent,
  createMenuItemUpdatedEvent,
  createMenuItemRemovedEvent
} from '../events/restaurantEvents';

export async function createRestaurant(
  eventStore: any,
  name: string,
  address: string,
  phone: string,
  email: string,
  logo?: string,
  description?: string
) {
  const restaurantId = uuidv4();
  const restaurantAggregate = new RestaurantAggregate();
  
  const event = createRestaurantCreatedEvent(
    restaurantId,
    0, // Initial version
    {
      id: restaurantId,
      name,
      address,
      phone,
      email,
      logo,
      description
    }
  );

  restaurantAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: restaurantId,
    aggregate_type: 'restaurant',
    version: 0,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return restaurantAggregate.getState();
}

export async function updateRestaurant(
  eventStore: any,
  restaurantId: string,
  updates: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    description?: string;
    isActive?: boolean;
  }
) {
  // Get all events for this restaurant from the event store
  const events = await eventStore.getEventsForAggregate('restaurant', restaurantId);
  
  // Reconstruct the current state of the restaurant
  const restaurantAggregate = new RestaurantAggregate();
  events.forEach((event: any) => {
    restaurantAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the update event
  const event = createRestaurantUpdatedEvent(
    restaurantId,
    events.length, // Next version
    updates
  );

  restaurantAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: restaurantId,
    aggregate_type: 'restaurant',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return restaurantAggregate.getState();
}

export async function addMenuCategory(
  eventStore: any,
  restaurantId: string,
  name: string,
  description?: string
) {
  // Get all events for this restaurant from the event store
  const events = await eventStore.getEventsForAggregate('restaurant', restaurantId);
  
  // Reconstruct the current state of the restaurant
  const restaurantAggregate = new RestaurantAggregate();
  events.forEach((event: any) => {
    restaurantAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the menu category added event
  const categoryId = uuidv4();
  const event = createMenuCategoryAddedEvent(
    restaurantId,
    events.length, // Next version
    {
      categoryId,
      name,
      description
    }
  );

  restaurantAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: restaurantId,
    aggregate_type: 'restaurant',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return {
    ...restaurantAggregate.getState(),
    addedCategoryId: categoryId
  };
}

export async function updateMenuCategory(
  eventStore: any,
  restaurantId: string,
  categoryId: string,
  updates: {
    name?: string;
    description?: string;
  }
) {
  // Get all events for this restaurant from the event store
  const events = await eventStore.getEventsForAggregate('restaurant', restaurantId);
  
  // Reconstruct the current state of the restaurant
  const restaurantAggregate = new RestaurantAggregate();
  events.forEach((event: any) => {
    restaurantAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the menu category updated event
  const event = createMenuCategoryUpdatedEvent(
    restaurantId,
    events.length, // Next version
    {
      categoryId,
      ...updates
    }
  );

  restaurantAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: restaurantId,
    aggregate_type: 'restaurant',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return restaurantAggregate.getState();
}

export async function removeMenuCategory(
  eventStore: any,
  restaurantId: string,
  categoryId: string
) {
  // Get all events for this restaurant from the event store
  const events = await eventStore.getEventsForAggregate('restaurant', restaurantId);
  
  // Reconstruct the current state of the restaurant
  const restaurantAggregate = new RestaurantAggregate();
  events.forEach((event: any) => {
    restaurantAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the menu category removed event
  const event = createMenuCategoryRemovedEvent(
    restaurantId,
    events.length, // Next version
    {
      categoryId
    }
  );

  restaurantAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: restaurantId,
    aggregate_type: 'restaurant',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return restaurantAggregate.getState();
}

export async function addMenuItem(
  eventStore: any,
  restaurantId: string,
  categoryId: string,
  name: string,
  price: number,
  description?: string,
  image?: string
) {
  // Get all events for this restaurant from the event store
  const events = await eventStore.getEventsForAggregate('restaurant', restaurantId);
  
  // Reconstruct the current state of the restaurant
  const restaurantAggregate = new RestaurantAggregate();
  events.forEach((event: any) => {
    restaurantAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the menu item added event
  const itemId = uuidv4();
  const event = createMenuItemAddedEvent(
    restaurantId,
    events.length, // Next version
    {
      categoryId,
      itemId,
      name,
      price,
      description,
      image,
      available: true
    }
  );

  restaurantAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: restaurantId,
    aggregate_type: 'restaurant',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return {
    ...restaurantAggregate.getState(),
    addedItemId: itemId
  };
}

export async function updateMenuItem(
  eventStore: any,
  restaurantId: string,
  categoryId: string,
  itemId: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
    image?: string;
    available?: boolean;
  }
) {
  // Get all events for this restaurant from the event store
  const events = await eventStore.getEventsForAggregate('restaurant', restaurantId);
  
  // Reconstruct the current state of the restaurant
  const restaurantAggregate = new RestaurantAggregate();
  events.forEach((event: any) => {
    restaurantAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the menu item updated event
  const event = createMenuItemUpdatedEvent(
    restaurantId,
    events.length, // Next version
    {
      categoryId,
      itemId,
      ...updates
    }
  );

  restaurantAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: restaurantId,
    aggregate_type: 'restaurant',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return restaurantAggregate.getState();
}

export async function removeMenuItem(
  eventStore: any,
  restaurantId: string,
  categoryId: string,
  itemId: string
) {
  // Get all events for this restaurant from the event store
  const events = await eventStore.getEventsForAggregate('restaurant', restaurantId);
  
  // Reconstruct the current state of the restaurant
  const restaurantAggregate = new RestaurantAggregate();
  events.forEach((event: any) => {
    restaurantAggregate.applyEvent({
      ...event,
      type: event.type,
      aggregateId: event.aggregate_id,
      version: event.version,
      data: event.data
    });
  });

  // Create and apply the menu item removed event
  const event = createMenuItemRemovedEvent(
    restaurantId,
    events.length, // Next version
    {
      categoryId,
      itemId
    }
  );

  restaurantAggregate.applyEvent(event);

  // Save the event to the event store
  await eventStore.saveEvent({
    aggregate_id: restaurantId,
    aggregate_type: 'restaurant',
    version: events.length,
    type: event.type,
    data: event.data,
    metadata: {}
  });

  return restaurantAggregate.getState();
}
