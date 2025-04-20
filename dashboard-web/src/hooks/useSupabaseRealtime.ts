import { useEffect, useState, useRef } from 'react';
import { realtimeService } from '@/services/supabase/realtimeService';

type SubscriptionType = {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  recordId?: string;
};

type UseRealtimeOptions = {
  enabled?: boolean;
  onError?: (error: any) => void;
};

/**
 * Hook for subscribing to Supabase Realtime events
 * 
 * @param subscriptionType The type of subscription to create
 * @param callback Function to call when an event is received
 * @param options Additional options for the subscription
 * @returns Object with subscription state
 */
export function useSupabaseRealtime<T = any>(
  subscriptionType: SubscriptionType,
  callback: (payload: T) => void,
  options: UseRealtimeOptions = {}
) {
  const { enabled = true, onError } = options;
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvent, setLastEvent] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const subscriptionRef = useRef<{id: string; unsubscribe: () => void} | null>(null);

  // Handle event data
  const handleEvent = (payload: any) => {
    try {
      setLastEvent(payload);
      callback(payload);
    } catch (err) {
      setError(err);
      if (onError) onError(err);
      console.error('Error in realtime event handler:', err);
    }
  };

  // Set up and tear down subscription
  useEffect(() => {
    if (!enabled) return;
    
    try {
      let subscription;
      
      // Create the appropriate subscription type
      if (subscriptionType.recordId) {
        subscription = realtimeService.subscribeToRecord(
          subscriptionType.table,
          subscriptionType.recordId,
          handleEvent
        );
      } else {
        subscription = realtimeService.subscribeToTable(
          subscriptionType.table,
          subscriptionType.event || '*',
          handleEvent,
          subscriptionType.filter
        );
      }
      
      subscriptionRef.current = subscription;
      setIsSubscribed(true);
      
      // Clean up subscription on unmount
      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
          setIsSubscribed(false);
        }
      };
    } catch (err) {
      setError(err);
      if (onError) onError(err);
      console.error('Error setting up realtime subscription:', err);
    }
  }, [
    enabled,
    subscriptionType.table,
    subscriptionType.event,
    subscriptionType.filter,
    subscriptionType.recordId
  ]);

  return {
    isSubscribed,
    lastEvent,
    error,
    // Allow manually unsubscribing if needed
    unsubscribe: () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
        setIsSubscribed(false);
      }
    }
  };
}
