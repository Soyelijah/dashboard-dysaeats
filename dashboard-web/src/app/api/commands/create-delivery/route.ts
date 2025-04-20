import { NextResponse } from 'next/server';
import { createDelivery } from '@/commands/deliveryCommands';
import { supabase } from '@/services/supabase/client';
import { eventStore } from '@/services/supabase/eventStore';
import { projectDeliveries } from '@/projectors/deliveryProjector';

export async function POST(request: Request) {
  try {
    const { orderId, pickupAddress, deliveryAddress, estimatedDeliveryTime, notes } = await request.json();
    
    if (!orderId || !pickupAddress || !deliveryAddress) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: orderId, pickupAddress, and deliveryAddress are required' 
      }, { status: 400 });
    }
    
    // Parse date string if provided
    let estimatedTime: Date | undefined;
    if (estimatedDeliveryTime) {
      estimatedTime = new Date(estimatedDeliveryTime);
    }
    
    // Execute the create delivery command
    const delivery = await createDelivery(
      eventStore, 
      orderId, 
      pickupAddress, 
      deliveryAddress, 
      estimatedTime, 
      notes
    );
    
    // Project the new delivery and related events to the database
    await projectDeliveries(eventStore, supabase);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Delivery created successfully',
      entity: delivery
    });
  } catch (error) {
    console.error('Error creating delivery:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    }, { status: 500 });
  }
}