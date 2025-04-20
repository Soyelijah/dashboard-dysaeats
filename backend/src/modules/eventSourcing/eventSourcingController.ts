import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

export const eventSourcingController = {
  // Get all events
  async getAllEvents(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },
  
  // Get event by ID
  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },
  
  // Create event
  async createEvent(req: Request, res: Response) {
    try {
      const eventData = req.body;
      
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      
      if (error) throw error;
      
      return res.status(201).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create event',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },
  
  // Delete event
  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete event',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },
  
  // Get events by aggregate type and ID
  async getEventsByAggregate(req: Request, res: Response) {
    try {
      const { type, id } = req.params;
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('aggregate_type', type)
        .eq('aggregate_id', id)
        .order('version', { ascending: true });
      
      if (error) throw error;
      
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching events by aggregate:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch events by aggregate',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  },
  
  // Get event types
  async getEventTypes(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('type');
      
      if (error) throw error;
      
      // Extract unique event types
      const types = new Set(data?.map(event => event.type));
      
      return res.status(200).json({
        success: true,
        data: Array.from(types)
      });
    } catch (error) {
      console.error('Error fetching event types:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch event types',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
};