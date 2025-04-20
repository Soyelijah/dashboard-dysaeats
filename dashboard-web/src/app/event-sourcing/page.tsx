'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function EventSourcingPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [aggregates, setAggregates] = useState<string[]>(['Order', 'User', 'Restaurant', 'Menu', 'Delivery', 'Payment']);
  const [selectedAggregate, setSelectedAggregate] = useState('Order');
  const [aggregateId, setAggregateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [createEventPayload, setCreateEventPayload] = useState('{\n  "type": "ORDER_CREATED",\n  "payload": {\n    "orderId": "id-will-be-generated",\n    "restaurantId": "sample-restaurant-id",\n    "userId": "sample-user-id",\n    "orderType": "PICKUP",\n    "status": "DRAFT",\n    "createdAt": "auto-generated"\n  },\n  "metadata": {\n    "source": "event-sourcing-explorer"\n  }\n}');

  // Fetch events for a specific aggregate
  const fetchEvents = async (type: string, id: string) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/event-store/events/${type}/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }
      const data = await response.json();
      setEvents(data);
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
      const newAggregateId = aggregateId || uuidv4();
      setAggregateId(newAggregateId);
      
      // Get latest version for this aggregate
      let version = 1;
      try {
        const versionResponse = await fetch(`http://localhost:3001/event-store/latest-version/${selectedAggregate}/${newAggregateId}`);
        if (versionResponse.ok) {
          const versionData = await versionResponse.json();
          version = (versionData.version || 0) + 1;
        }
      } catch (error) {
        console.warn('Error fetching version, using 1:', error);
      }
      
      // Create the event with updated fields
      const eventData = {
        aggregate_type: selectedAggregate,
        aggregate_id: newAggregateId,
        type: payload.type,
        payload: {
          ...payload.payload,
          orderId: newAggregateId
        },
        metadata: payload.metadata || {},
        version
      };
      
      // Save the event
      const response = await fetch('http://localhost:3001/event-store/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        throw new Error(`Error creating event: ${response.statusText}`);
      }
      
      const savedEvent = await response.json();
      alert(`Event created successfully with ID: ${savedEvent.id}`);
      
      // Refresh events list
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
      case 'Order':
        return `{
  "type": "ORDER_CREATED",
  "payload": {
    "orderId": "id-will-be-generated",
    "restaurantId": "sample-restaurant-id",
    "userId": "sample-user-id",
    "orderType": "PICKUP",
    "status": "DRAFT",
    "createdAt": "auto-generated"
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
      case 'User':
        return `{
  "type": "USER_REGISTERED",
  "payload": {
    "userId": "id-will-be-generated",
    "email": "user@example.com",
    "name": "Example User",
    "createdAt": "auto-generated" 
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
      case 'Restaurant':
        return `{
  "type": "RESTAURANT_CREATED",
  "payload": {
    "restaurantId": "id-will-be-generated",
    "name": "Example Restaurant",
    "description": "A sample restaurant",
    "address": "123 Main St",
    "createdAt": "auto-generated"
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
      default:
        return `{
  "type": "${aggregateType.toUpperCase()}_CREATED",
  "payload": {
    "${aggregateType.toLowerCase()}Id": "id-will-be-generated",
    "name": "Example ${aggregateType}",
    "createdAt": "auto-generated"
  },
  "metadata": {
    "source": "event-sourcing-explorer"
  }
}`;
    }
  };

  // When aggregate type changes, update the example payload
  useEffect(() => {
    setCreateEventPayload(generateExamplePayload(selectedAggregate));
  }, [selectedAggregate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Event Sourcing Explorer</h1>
      
      {/* Create new event section */}
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
                  <option key={agg} value={agg}>{agg}</option>
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
                  onClick={() => setAggregateId(uuidv4())}
                >
                  Generate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ID of the entity this event belongs to (e.g., specific order, user, etc.)
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
            <label className="block text-sm font-medium mb-1">Event Payload (JSON)</label>
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
        <h2 className="text-xl font-semibold mb-4">Events for {selectedAggregate} ({aggregateId || 'No ID selected'})</h2>
        
        {events.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {loading ? 'Loading events...' : 'No events found. Create some events or fetch them using an ID.'}
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
                    {JSON.stringify(event.payload, null, 2)}
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
    </div>
  );
}