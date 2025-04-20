import { NextResponse } from 'next/server';
import { createPayment } from '@/commands/paymentCommands';
import { supabase } from '@/services/supabase/client';
import { eventStore } from '@/services/supabase/eventStore';
import { projectPayments } from '@/projectors/paymentProjector';

export async function POST(request: Request) {
  try {
    const { orderId, userId, amount, paymentMethod, currency, metadata } = await request.json();
    
    if (!orderId || !userId || amount === undefined || amount === null || !paymentMethod) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: orderId, userId, amount, and paymentMethod are required' 
      }, { status: 400 });
    }
    
    // Execute the create payment command
    const payment = await createPayment(
      eventStore, 
      orderId, 
      userId, 
      Number(amount), 
      paymentMethod, 
      currency || 'CLP', 
      metadata
    );
    
    // Project the new payment and related events to the database
    await projectPayments(eventStore, supabase);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment created successfully',
      entity: payment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    }, { status: 500 });
  }
}