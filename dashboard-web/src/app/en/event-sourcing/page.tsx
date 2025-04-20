'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import EventExplorer from '@/components/event-sourcing/EventExplorer';
import { eventStore } from '@/services/supabase/eventStore';
import { supabase } from '@/services/supabase/client';

// Function to generate UUIDs instead of using the uuid package
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function EventSourcingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'explorer' | 'create'>('explorer');
  const [events, setEvents] = useState<any[]>([]);
  const [aggregates, setAggregates] = useState<string[]>(['order', 'user', 'restaurant', 'delivery', 'payment']);
  const [selectedAggregate, setSelectedAggregate] = useState('order');
  const [aggregateId, setAggregateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [createEventPayload, setCreateEventPayload] = useState(`{
  "type": "OrderCreatedEvent",
  "data": {
    "id": "will-be-generated-automatically",
    "userId": "example-user-id",
    "restaurantId": "example-restaurant-id",
    "items": []
  }
}`);

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/en/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // When aggregate type changes, update example payload
  useEffect(() => {
    setCreateEventPayload(generateExamplePayload(selectedAggregate));
  }, [selectedAggregate]);

  // Fetch events for a specific aggregate
  const fetchEvents = async (type: string, id: string) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const events = await eventStore.getEventsForAggregate(type, id);
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert(`Error fetching events: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Create a new event
  const createEvent = async () => {
    try {
      setLoading(true);
      
      // Parse the payload from textarea
      const payload = JSON.parse(createEventPayload);
      
      // Generate a new ID if needed for the aggregate
      const newAggregateId = aggregateId || generateUUID();
      setAggregateId(newAggregateId);
      
      // Get latest version for this aggregate
      let version = 0;
      try {
        version = await eventStore.getLatestVersion(selectedAggregate, newAggregateId);
      } catch (error) {
        console.warn('Error fetching version, using 0:', error);
      }
      
      // Create the event with updated fields
      const eventData = {
        aggregate_id: newAggregateId,
        aggregate_type: selectedAggregate,
        type: payload.type,
        data: {
          ...payload.data,
          id: newAggregateId
        },
        metadata: payload.metadata || {},
        version: version
      };
      
      // Save the event
      const savedEvent = await eventStore.saveEvent(eventData);
      alert(`Event created successfully!`);
      
      // Update events list
      fetchEvents(selectedAggregate, newAggregateId);
      
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Error creating event: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate example payload based on selected aggregate type
  const generateExamplePayload = (aggregateType: string) => {
    switch (aggregateType) {
      case 'order':
        return `{
  "type": "OrderCreatedEvent",
  "data": {
    "id": "will-be-generated-automatically",
    "userId": "example-user-id",
    "restaurantId": "example-restaurant-id",
    "items": []
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
      case 'user':
        return `{
  "type": "UserCreatedEvent",
  "data": {
    "id": "will-be-generated-automatically",
    "email": "user@example.com",
    "firstName": "First",
    "lastName": "Last",
    "role": "customer"
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
      case 'restaurant':
        return `{
  "type": "RestaurantCreatedEvent",
  "data": {
    "id": "will-be-generated-automatically",
    "name": "Example Restaurant",
    "address": "123 Example St",
    "phone": "123-456-7890",
    "email": "restaurant@example.com"
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
      case 'delivery':
        return `{
  "type": "DeliveryCreatedEvent",
  "data": {
    "id": "will-be-generated-automatically",
    "orderId": "example-order-id",
    "pickupAddress": "Restaurant Address 123",
    "deliveryAddress": "Customer Address 456"
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
      case 'payment':
        return `{
  "type": "PaymentCreatedEvent",
  "data": {
    "id": "will-be-generated-automatically",
    "orderId": "example-order-id",
    "userId": "example-user-id",
    "amount": 1500,
    "currency": "USD",
    "paymentMethod": "credit_card"
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
      default:
        return `{
  "type": "${aggregateType.charAt(0).toUpperCase() + aggregateType.slice(1)}CreatedEvent",
  "data": {
    "id": "will-be-generated-automatically",
    "name": "${aggregateType} example"
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !isAuthenticated || !user ? (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
          <p className="text-yellow-700">You must be logged in to access this page.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Event Sourcing Explorer</h1>
            <button
              onClick={() => router.push('/en/admin')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  className={`${
                    activeTab === 'explorer'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } py-4 px-6 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('explorer')}
                >
                  Events Explorer
                </button>
                <button
                  className={`${
                    activeTab === 'create'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } py-4 px-6 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('create')}
                >
                  Create Events
                </button>
              </nav>
            </div>
          </div>
          
          {activeTab === 'explorer' && (
            <EventExplorer />
          )}
          
          {activeTab === 'create' && (
            <>
              {/* Create events section */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Aggregate Type</label>
                      <select 
                        className="w-full p-2 border rounded"
                        value={selectedAggregate}
                        onChange={(e) => setSelectedAggregate(e.target.value)}
                      >
                        {aggregates.map(agg => (
                          <option key={agg} value={agg}>{agg.charAt(0).toUpperCase() + agg.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Aggregate ID</label>
                      <div className="flex">
                        <input 
                          type="text" 
                          className="flex-1 p-2 border rounded-l"
                          value={aggregateId}
                          onChange={(e) => setAggregateId(e.target.value)}
                          placeholder="Leave empty to generate automatically"
                        />
                        <button 
                          className="bg-blue-100 text-blue-600 px-2 py-1 rounded-r border-t border-r border-b"
                          onClick={() => setAggregateId(generateUUID())}
                        >
                          Generate
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ID of the entity this event belongs to (e.g., an order, user, etc.)
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                        onClick={createEvent}
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Event'}
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                        onClick={() => fetchEvents(selectedAggregate, aggregateId)}
                        disabled={loading || !aggregateId}
                      >
                        {loading ? 'Loading...' : 'Fetch Events'}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Event Data (JSON)</label>
                    <textarea
                      className="w-full p-2 border rounded font-mono text-sm h-64"
                      value={createEventPayload}
                      onChange={(e) => setCreateEventPayload(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Events list */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Events for {selectedAggregate.charAt(0).toUpperCase() + selectedAggregate.slice(1)} ({aggregateId || 'No ID selected'})
                </h2>
                
                {events.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    {loading ? 'Loading events...' : 'No events found. Create events or fetch them using an ID.'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-blue-600">{event.type}</span>
                          <span className="text-gray-500 text-sm">Version: {event.version}</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-40">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </div>
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Metadata:</p>
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap overflow-auto max-h-20">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}