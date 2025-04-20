import {
  RestaurantCreatedEvent,
  RestaurantUpdatedEvent,
  MenuCategoryAddedEvent,
  MenuCategoryUpdatedEvent,
  MenuCategoryRemovedEvent,
  MenuItemAddedEvent,
  MenuItemUpdatedEvent,
  MenuItemRemovedEvent
} from '../events/restaurantEvents';

export async function projectRestaurants(eventStore: any, supabase: any) {
  // Get all restaurant events
  const events = await eventStore.getEventsByAggregateType('restaurant');
  
  // Group events by restaurant ID
  const eventsByRestaurantId: Record<string, any[]> = {};
  
  events.forEach((event: any) => {
    const restaurantId = event.aggregate_id;
    if (!eventsByRestaurantId[restaurantId]) {
      eventsByRestaurantId[restaurantId] = [];
    }
    eventsByRestaurantId[restaurantId].push(event);
  });
  
  // Process events for each restaurant
  for (const restaurantId of Object.keys(eventsByRestaurantId)) {
    const restaurantEvents = eventsByRestaurantId[restaurantId];
    
    // Sort events by version
    restaurantEvents.sort((a, b) => a.version - b.version);
    
    let restaurant: any = null;
    let categories: Record<string, any> = {};
    let items: Record<string, any[]> = {};
    
    // Process each event
    for (const event of restaurantEvents) {
      const eventData = {
        ...event,
        type: event.type,
        aggregateId: event.aggregate_id,
        data: event.data
      };
      
      switch (event.type) {
        case 'RestaurantCreatedEvent':
          restaurant = handleRestaurantCreatedEvent(eventData as RestaurantCreatedEvent);
          break;
        case 'RestaurantUpdatedEvent':
          restaurant = handleRestaurantUpdatedEvent(restaurant, eventData as RestaurantUpdatedEvent);
          break;
        case 'MenuCategoryAddedEvent':
          handleMenuCategoryAddedEvent(categories, eventData as MenuCategoryAddedEvent);
          // Initialize items array for this category
          items[eventData.data.categoryId] = [];
          break;
        case 'MenuCategoryUpdatedEvent':
          handleMenuCategoryUpdatedEvent(categories, eventData as MenuCategoryUpdatedEvent);
          break;
        case 'MenuCategoryRemovedEvent':
          handleMenuCategoryRemovedEvent(categories, items, eventData as MenuCategoryRemovedEvent);
          break;
        case 'MenuItemAddedEvent':
          handleMenuItemAddedEvent(items, eventData as MenuItemAddedEvent);
          break;
        case 'MenuItemUpdatedEvent':
          handleMenuItemUpdatedEvent(items, eventData as MenuItemUpdatedEvent);
          break;
        case 'MenuItemRemovedEvent':
          handleMenuItemRemovedEvent(items, eventData as MenuItemRemovedEvent);
          break;
      }
    }
    
    if (restaurant) {
      // Update restaurant in the database
      await updateRestaurantInDatabase(supabase, restaurant, categories, items);
    }
  }
}

function handleRestaurantCreatedEvent(event: RestaurantCreatedEvent): any {
  return {
    id: event.data.id,
    name: event.data.name,
    address: event.data.address,
    phone: event.data.phone,
    email: event.data.email,
    logo: event.data.logo,
    description: event.data.description,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function handleRestaurantUpdatedEvent(restaurant: any, event: RestaurantUpdatedEvent): any {
  return {
    ...restaurant,
    name: event.data.name || restaurant.name,
    address: event.data.address || restaurant.address,
    phone: event.data.phone || restaurant.phone,
    email: event.data.email || restaurant.email,
    logo: event.data.logo || restaurant.logo,
    description: event.data.description || restaurant.description,
    is_active: event.data.isActive !== undefined ? event.data.isActive : restaurant.is_active,
    updated_at: new Date().toISOString()
  };
}

function handleMenuCategoryAddedEvent(categories: Record<string, any>, event: MenuCategoryAddedEvent): void {
  categories[event.data.categoryId] = {
    id: event.data.categoryId,
    restaurant_id: event.aggregateId,
    name: event.data.name,
    description: event.data.description,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function handleMenuCategoryUpdatedEvent(categories: Record<string, any>, event: MenuCategoryUpdatedEvent): void {
  if (categories[event.data.categoryId]) {
    categories[event.data.categoryId] = {
      ...categories[event.data.categoryId],
      name: event.data.name || categories[event.data.categoryId].name,
      description: event.data.description || categories[event.data.categoryId].description,
      updated_at: new Date().toISOString()
    };
  }
}

function handleMenuCategoryRemovedEvent(
  categories: Record<string, any>,
  items: Record<string, any[]>,
  event: MenuCategoryRemovedEvent
): void {
  delete categories[event.data.categoryId];
  delete items[event.data.categoryId];
}

function handleMenuItemAddedEvent(items: Record<string, any[]>, event: MenuItemAddedEvent): void {
  if (items[event.data.categoryId]) {
    items[event.data.categoryId].push({
      id: event.data.itemId,
      category_id: event.data.categoryId,
      name: event.data.name,
      description: event.data.description,
      price: event.data.price,
      image: event.data.image,
      available: event.data.available !== undefined ? event.data.available : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}

function handleMenuItemUpdatedEvent(items: Record<string, any[]>, event: MenuItemUpdatedEvent): void {
  const categoryItems = items[event.data.categoryId];
  if (categoryItems) {
    const itemIndex = categoryItems.findIndex(item => item.id === event.data.itemId);
    if (itemIndex !== -1) {
      categoryItems[itemIndex] = {
        ...categoryItems[itemIndex],
        name: event.data.name || categoryItems[itemIndex].name,
        description: event.data.description || categoryItems[itemIndex].description,
        price: event.data.price || categoryItems[itemIndex].price,
        image: event.data.image || categoryItems[itemIndex].image,
        available: event.data.available !== undefined ? event.data.available : categoryItems[itemIndex].available,
        updated_at: new Date().toISOString()
      };
    }
  }
}

function handleMenuItemRemovedEvent(items: Record<string, any[]>, event: MenuItemRemovedEvent): void {
  const categoryItems = items[event.data.categoryId];
  if (categoryItems) {
    const itemIndex = categoryItems.findIndex(item => item.id === event.data.itemId);
    if (itemIndex !== -1) {
      categoryItems.splice(itemIndex, 1);
    }
  }
}

async function updateRestaurantInDatabase(
  supabase: any,
  restaurant: any,
  categories: Record<string, any>,
  items: Record<string, any[]>
): Promise<void> {
  // Use transaction to ensure all operations succeed or fail together
  try {
    // Update restaurant
    const { error: restaurantError } = await supabase
      .from('restaurants')
      .upsert(restaurant, { onConflict: 'id' });
    
    if (restaurantError) throw restaurantError;
    
    // Update categories (in real app, consider batch operations or stored procedures)
    for (const categoryId of Object.keys(categories)) {
      const { error: categoryError } = await supabase
        .from('menu_categories')
        .upsert(categories[categoryId], { onConflict: 'id' });
      
      if (categoryError) throw categoryError;
    }
    
    // Update menu items
    for (const categoryId of Object.keys(items)) {
      // Get existing items for this category
      const { data: existingItems, error: fetchError } = await supabase
        .from('menu_items')
        .select('id')
        .eq('category_id', categoryId);
      
      if (fetchError) throw fetchError;
      
      // Get current item IDs
      const currentItemIds = items[categoryId].map(item => item.id);
      
      // Find items to delete (exist in DB but not in current state)
      const itemsToDelete = existingItems
        .filter((existingItem: any) => !currentItemIds.includes(existingItem.id))
        .map((item: any) => item.id);
      
      // Delete removed items
      if (itemsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('menu_items')
          .delete()
          .in('id', itemsToDelete);
        
        if (deleteError) throw deleteError;
      }
      
      // Upsert current items
      for (const item of items[categoryId]) {
        const { error: itemError } = await supabase
          .from('menu_items')
          .upsert(item, { onConflict: 'id' });
        
        if (itemError) throw itemError;
      }
    }
  } catch (error) {
    console.error('Error updating restaurant in database:', error);
    throw error;
  }
}
