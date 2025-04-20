import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Export database types
export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          aggregate_id: string;
          aggregate_type: string;
          type: string;
          version: number;
          payload: any;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          aggregate_id: string;
          aggregate_type: string;
          type: string;
          version: number;
          payload: any;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          aggregate_id?: string;
          aggregate_type?: string;
          type?: string;
          version?: number;
          payload?: any;
          metadata?: any;
          created_at?: string;
        };
      };
      snapshots: {
        Row: {
          id: string;
          aggregate_id: string;
          aggregate_type: string;
          state: any;
          version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          aggregate_id: string;
          aggregate_type: string;
          state: any;
          version: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          aggregate_id?: string;
          aggregate_type?: string;
          state?: any;
          version?: number;
          created_at?: string;
        };
      };
      // Add other tables as needed
    };
  };
};