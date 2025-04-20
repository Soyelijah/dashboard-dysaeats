import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './client';

// Types
export interface Event {
  id?: string;
  aggregate_id: string;
  aggregate_type: string;
  type: string;
  data?: Record<string, any>; // For frontend processing
  payload?: Record<string, any>; // DB field
  version: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface Snapshot {
  id?: string;
  aggregate_id: string;
  aggregate_type: string;
  state: Record<string, any>;
  version: number;
  created_at?: string;
}

export class EventStore {
  private emitter: EventEmitter;
  private snapshotFrequency: number;

  constructor(snapshotFrequency: number = 10) {
    this.emitter = new EventEmitter();
    this.snapshotFrequency = snapshotFrequency;
    
    // Set up real-time subscriptions
    this.setupRealtimeSubscriptions();
  }

  private setupRealtimeSubscriptions() {
    // Subscribe to events table for real-time updates
    supabase
      .channel('events-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'events' 
      }, (payload) => {
        const event = payload.new as Event;
        // Emit the event to listeners
        this.emitter.emit(event.type, event);
        this.emitter.emit(`${event.aggregate_type}:${event.aggregate_id}`, event);
      })
      .subscribe();
  }

  // Save an event to the database
  async saveEvent(event: {
    aggregate_id: string;
    aggregate_type: string;
    version: number;
    type: string;
    data: any;
    metadata?: Record<string, any>;
  }): Promise<Event> {
    // Convert 'data' field to 'payload' as per database schema
    const completeEvent = {
      ...event,
      payload: event.data, // Map data to payload field in DB
      id: uuidv4(),
      created_at: new Date().toISOString()
    };
    
    // Remove the data field as it's being mapped to payload
    delete completeEvent.data;

    const { data, error } = await supabase
      .from('events')
      .insert(completeEvent)
      .select()
      .single();

    if (error) {
      console.error('Error saving event:', error);
      throw new Error(`Failed to save event: ${error.message}`);
    }

    const savedEvent = data as Event;
    
    // Check if we need to create a snapshot
    if (event.version % this.snapshotFrequency === 0) {
      // Attempt to create a snapshot if needed
      try {
        const state = await this.getAggregateState(event.aggregate_type, event.aggregate_id);
        if (state) {
          await this.saveSnapshot({
            aggregate_id: event.aggregate_id,
            aggregate_type: event.aggregate_type,
            state,
            version: event.version
          });
        }
      } catch (error) {
        console.error('Failed to create snapshot:', error);
        // Continue even if snapshot creation fails
      }
    }

    // Emit the event (even though we also have real-time, this helps with local updates)
    this.emitter.emit(savedEvent.type, savedEvent);
    this.emitter.emit(`${savedEvent.aggregate_type}:${savedEvent.aggregate_id}`, savedEvent);

    return savedEvent;
  }

  // Get all events for an aggregate
  async getEventsForAggregate(aggregateType: string, aggregateId: string, fromVersion: number = 0): Promise<Event[]> {
    let query = supabase
      .from('events')
      .select('*')
      .eq('aggregate_type', aggregateType)
      .eq('aggregate_id', aggregateId)
      .order('version', { ascending: true });

    if (fromVersion > 0) {
      query = query.gte('version', fromVersion);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    // Map the payload field to data for frontend consistency
    const events = data?.map(event => ({
      ...event,
      data: event.payload // Add data field for frontend compatibility
    })) || [];

    return events;
  }

  // Get all events of a specific type
  async getEventsByType(eventType: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('type', eventType)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching events by type:', error);
      throw new Error(`Failed to fetch events by type: ${error.message}`);
    }

    return data || [];
  }

  // Get all events for a specific aggregate type
  async getEventsByAggregateType(aggregateType: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('aggregate_type', aggregateType)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching events by aggregate type:', error);
      throw new Error(`Failed to fetch events by aggregate type: ${error.message}`);
    }

    return data || [];
  }

  // Get the latest snapshot for an aggregate
  async getLatestSnapshot(aggregateType: string, aggregateId: string): Promise<Snapshot | null> {
    const { data, error } = await supabase
      .from('snapshots')
      .select('*')
      .eq('aggregate_type', aggregateType)
      .eq('aggregate_id', aggregateId)
      .order('version', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching snapshot:', error);
      throw new Error(`Failed to fetch snapshot: ${error.message}`);
    }

    return data && data.length > 0 ? data[0] : null;
  }

  // Save a snapshot
  async saveSnapshot(snapshot: {
    aggregate_id: string;
    aggregate_type: string;
    version: number;
    state: any;
  }): Promise<Snapshot> {
    const completeSnapshot = {
      ...snapshot,
      id: uuidv4(),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('snapshots')
      .insert(completeSnapshot)
      .select()
      .single();

    if (error) {
      console.error('Error saving snapshot:', error);
      throw new Error(`Failed to save snapshot: ${error.message}`);
    }

    return data as Snapshot;
  }

  // Helper method to get the latest version for an aggregate
  async getLatestVersion(aggregateType: string, aggregateId: string): Promise<number> {
    const { data, error } = await supabase
      .from('events')
      .select('version')
      .eq('aggregate_type', aggregateType)
      .eq('aggregate_id', aggregateId)
      .order('version', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error getting latest version:', error);
      throw new Error(`Failed to get latest version: ${error.message}`);
    }

    return data && data.length > 0 ? data[0].version : 0;
  }

  // This method rebuilds the current state of an aggregate from events
  private async getAggregateState(aggregateType: string, aggregateId: string): Promise<Record<string, any> | null> {
    // Get all events for the aggregate
    const events = await this.getEventsForAggregate(aggregateType, aggregateId);
    
    if (events.length === 0) {
      return null;
    }
    
    // Simplified approach - just return the amalgamation of all data
    // In a real implementation, each aggregate would have its own state-building logic
    return events.reduce((state, event) => {
      return { ...state, ...event.data };
    }, {});
  }

  // Subscribe to events of a specific type
  on(eventType: string, handler: (event: Event) => void): void {
    this.emitter.on(eventType, handler);
  }

  // Subscribe to all events for a specific aggregate
  onAggregate(aggregateType: string, aggregateId: string, handler: (event: Event) => void): void {
    this.emitter.on(`${aggregateType}:${aggregateId}`, handler);
  }

  // Unsubscribe from events
  off(eventType: string, handler: (event: Event) => void): void {
    this.emitter.off(eventType, handler);
  }

  // Unsubscribe from aggregate events
  offAggregate(aggregateType: string, aggregateId: string, handler: (event: Event) => void): void {
    this.emitter.off(`${aggregateType}:${aggregateId}`, handler);
  }

  // Delete an event by ID
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      // First try to use the RPC function if available
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('delete_event', { event_id: eventId });
        
      if (!rpcError && rpcResult === true) {
        return true;
      }
      
      // Fall back to direct delete if RPC fails
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        
        // Check if error is related to permissions
        if (error.message.includes('permission') || error.code === '42501') {
          console.error('Permission denied to delete event. RLS policy may be missing.');
          throw new Error(`Permission denied to delete event: ${error.message}`);
        }
        
        throw new Error(`Failed to delete event: ${error.message}`);
      }

      // Return true to indicate successful deletion
      return true;
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const eventStore = new EventStore();