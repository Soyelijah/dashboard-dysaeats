import { NextResponse } from 'next/server';
import { createRestaurant } from '@/commands/restaurantCommands';
import { supabase } from '@/services/supabase/client';
import { eventStore } from '@/services/supabase/eventStore';
import { projectRestaurants } from '@/projectors/restaurantProjector';

export async function POST(request: Request) {
  try {
    const { name, address, phone, email, logo, description } = await request.json();
    
    if (!name || !address || !phone || !email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: name, address, phone, and email are required' 
      }, { status: 400 });
    }
    
    // Execute the create restaurant command
    const restaurant = await createRestaurant(
      eventStore, 
      name, 
      address, 
      phone, 
      email, 
      logo, 
      description
    );
    
    // Project the new restaurant and related events to the database
    await projectRestaurants(eventStore, supabase);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Restaurant created successfully',
      entity: restaurant
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    }, { status: 500 });
  }
}