import { NextResponse } from 'next/server';
import { createOrder } from '@/commands/orderCommands';
import { supabase } from '@/services/supabase/client';
import { eventStore } from '@/services/supabase/eventStore';
import { projectOrders } from '@/projectors/orderProjector';

export async function POST(request: Request) {
  try {
    const { userId, restaurantId, items } = await request.json();
    
    if (!userId || !restaurantId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: userId and restaurantId are required' 
      }, { status: 400 });
    }
    
    // Execute the create order command
    const order = await createOrder(eventStore, userId, restaurantId, items || []);
    
    // Project the new order and related events to the database
    await projectOrders(eventStore, supabase);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order created successfully',
      entity: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    }, { status: 500 });
  }
}