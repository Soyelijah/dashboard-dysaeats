'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import EventExplorer from '@/components/event-sourcing/EventExplorer';
import { eventStore } from '@/services/supabase/eventStore';
import { supabase } from '@/services/supabase/client';

// Función para generar UUIDs en lugar de usar el paquete uuid
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
    "id": "se-generará-automáticamente",
    "userId": "id-usuario-ejemplo",
    "restaurantId": "id-restaurante-ejemplo",
    "items": []
  }
}`);

  // Proteger ruta - redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/es/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Cuando cambia el tipo de agregado, actualizar la carga útil de ejemplo
  useEffect(() => {
    setCreateEventPayload(generateExamplePayload(selectedAggregate));
  }, [selectedAggregate]);

  // Obtener eventos para un agregado específico
  const fetchEvents = async (type: string, id: string) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const events = await eventStore.getEventsForAggregate(type, id);
      setEvents(events);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      alert(`Error al obtener eventos: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo evento
  const createEvent = async () => {
    try {
      setLoading(true);
      
      // Analizar la carga útil desde el textarea
      const payload = JSON.parse(createEventPayload);
      
      // Generar un nuevo ID si es necesario para el agregado
      const newAggregateId = aggregateId || generateUUID();
      setAggregateId(newAggregateId);
      
      // Obtener la última versión para este agregado
      let version = 0;
      try {
        version = await eventStore.getLatestVersion(selectedAggregate, newAggregateId);
      } catch (error) {
        console.warn('Error al obtener la versión, usando 0:', error);
      }
      
      // Crear el evento con campos actualizados
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
      
      // Guardar el evento
      const savedEvent = await eventStore.saveEvent(eventData);
      alert(`¡Evento creado exitosamente!`);
      
      // Actualizar lista de eventos
      fetchEvents(selectedAggregate, newAggregateId);
      
    } catch (error) {
      console.error('Error al crear evento:', error);
      alert(`Error al crear evento: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Generar carga útil de ejemplo basada en el tipo de agregado seleccionado
  const generateExamplePayload = (aggregateType: string) => {
    switch (aggregateType) {
      case 'order':
        return `{
  "type": "OrderCreatedEvent",
  "data": {
    "id": "se-generará-automáticamente",
    "userId": "id-usuario-ejemplo",
    "restaurantId": "id-restaurante-ejemplo",
    "items": []
  },
  "metadata": {
    "source": "explorador-event-sourcing"
  }
}`;
      case 'user':
        return `{
  "type": "UserCreatedEvent",
  "data": {
    "id": "se-generará-automáticamente",
    "email": "usuario@ejemplo.com",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "role": "cliente"
  },
  "metadata": {
    "source": "explorador-event-sourcing"
  }
}`;
      case 'restaurant':
        return `{
  "type": "RestaurantCreatedEvent",
  "data": {
    "id": "se-generará-automáticamente",
    "name": "Restaurante Ejemplo",
    "address": "Calle Ejemplo 123",
    "phone": "123-456-7890",
    "email": "restaurante@ejemplo.com"
  },
  "metadata": {
    "source": "explorador-event-sourcing"
  }
}`;
      case 'delivery':
        return `{
  "type": "DeliveryCreatedEvent",
  "data": {
    "id": "se-generará-automáticamente",
    "orderId": "id-pedido-ejemplo",
    "pickupAddress": "Dirección Restaurante 123",
    "deliveryAddress": "Dirección Cliente 456"
  },
  "metadata": {
    "source": "explorador-event-sourcing"
  }
}`;
      case 'payment':
        return `{
  "type": "PaymentCreatedEvent",
  "data": {
    "id": "se-generará-automáticamente",
    "orderId": "id-pedido-ejemplo",
    "userId": "id-usuario-ejemplo",
    "amount": 1500,
    "currency": "CLP",
    "paymentMethod": "tarjeta_credito"
  },
  "metadata": {
    "source": "explorador-event-sourcing"
  }
}`;
      default:
        return `{
  "type": "${aggregateType.charAt(0).toUpperCase() + aggregateType.slice(1)}CreatedEvent",
  "data": {
    "id": "se-generará-automáticamente",
    "name": "${aggregateType} ejemplo"
  },
  "metadata": {
    "source": "explorador-event-sourcing"
  }
}`;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : !isAuthenticated || !user ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
            <div className="text-center mb-6">
              <svg className="mx-auto h-14 w-14 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6V7m0 10a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
              <h2 className="mt-4 text-xl font-bold text-gray-900">Acceso Restringido</h2>
              <p className="mt-2 text-gray-600">Debe iniciar sesión para acceder a esta página.</p>
            </div>
            <button 
              onClick={() => router.push('/es/login')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Ir al Inicio de Sesión
            </button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Explorador de Event Sourcing</h1>
                <button
                  onClick={() => router.push('/es/admin')}
                  className="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver al Panel
                </button>
              </div>
              <p className="text-blue-100 mt-2">Visualiza, crea y gestiona eventos del sistema para modelar el estado de la aplicación</p>
            </div>
            
            {/* Pestañas */}
            <div className="bg-white">
              <nav className="flex border-b border-gray-200">
                <button
                  className={`${
                    activeTab === 'explorer'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } py-4 px-6 border-b-2 font-medium text-sm transition-colors inline-flex items-center`}
                  onClick={() => setActiveTab('explorer')}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  Explorador de Eventos
                </button>
                <button
                  className={`${
                    activeTab === 'create'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } py-4 px-6 border-b-2 font-medium text-sm transition-colors inline-flex items-center`}
                  onClick={() => setActiveTab('create')}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Crear Eventos
                </button>
              </nav>
            </div>
          </div>
          
          {activeTab === 'explorer' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <EventExplorer />
            </div>
          )}
          
          {activeTab === 'create' && (
            <>
              {/* Sección de creación de eventos */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 border-b pb-3">Crear Nuevo Evento</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <div>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tipo de Agregado</label>
                      <div className="relative">
                        <select 
                          className="block w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg appearance-none"
                          value={selectedAggregate}
                          onChange={(e) => setSelectedAggregate(e.target.value)}
                        >
                          {aggregates.map(agg => (
                            <option key={agg} value={agg}>{agg.charAt(0).toUpperCase() + agg.slice(1)}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1 sm:mt-2 text-xs text-gray-500">
                        Tipo de entidad que estás modelando (pedido, usuario, restaurante, etc.)
                      </p>
                    </div>
                    
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">ID del Agregado</label>
                      <div className="flex rounded-lg shadow-sm">
                        <input 
                          type="text" 
                          className="flex-1 block w-full rounded-none rounded-l-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4"
                          value={aggregateId}
                          onChange={(e) => setAggregateId(e.target.value)}
                          placeholder="Dejar vacío para generar automáticamente"
                        />
                        <button 
                          className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-3 border border-l-0 border-gray-300 rounded-r-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm"
                          onClick={() => setAggregateId(generateUUID())}
                        >
                          <svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="hidden sm:inline">Generar</span>
                          <span className="sm:hidden">Gen</span>
                        </button>
                      </div>
                      <p className="mt-1 sm:mt-2 text-xs text-gray-500">
                        ID de la entidad a la que pertenece este evento
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4">
                      <button
                        className="group relative flex justify-center py-2 sm:py-3 px-3 sm:px-4 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        onClick={createEvent}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creando...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Crear Evento
                          </span>
                        )}
                      </button>
                      
                      <button
                        className="group relative flex justify-center py-2 sm:py-3 px-3 sm:px-4 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={() => fetchEvents(selectedAggregate, aggregateId)}
                        disabled={loading || !aggregateId}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Cargando...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Buscar Eventos
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Datos del Evento (JSON)</label>
                    <div className="relative">
                      <div className="absolute top-0 right-0 p-1 sm:p-2 bg-gray-50 border-b border-l rounded-bl-lg text-xs font-mono text-gray-500">JSON</div>
                      <textarea
                        className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg font-mono text-xs sm:text-sm h-48 sm:h-64 focus:border-blue-500 focus:ring-blue-500"
                        value={createEventPayload}
                        onChange={(e) => setCreateEventPayload(e.target.value)}
                        spellCheck="false"
                      />
                    </div>
                    <p className="mt-1 sm:mt-2 text-xs text-gray-500">
                      Incluye toda la información del evento en formato JSON válido.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Lista de eventos */}
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 border-b pb-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
                    Eventos para {selectedAggregate.charAt(0).toUpperCase() + selectedAggregate.slice(1)}
                  </h2>
                  {aggregateId && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1 sm:mt-0 self-start sm:self-auto">
                      ID: <span className="truncate max-w-[120px] sm:max-w-none inline-block align-bottom">
                        {aggregateId.length > 16 
                          ? `${aggregateId.substring(0, 8)}...${aggregateId.substring(aggregateId.length - 4)}`
                          : aggregateId}
                      </span>
                    </span>
                  )}
                </div>
                
                {events.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-8 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                        <p className="text-gray-600">Cargando eventos...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600 mb-2">No se encontraron eventos</p>
                        <p className="text-sm text-gray-500">Crea eventos o búscalos usando un ID específico</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {event.type}
                            </span>
                            <span className="text-gray-500 text-xs sm:text-sm">Versión: {event.version}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(event.created_at).toLocaleString('es-ES', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="p-3 sm:p-4">
                          <div className="bg-gray-50 p-2 sm:p-3 rounded border border-gray-100">
                            <pre className="text-xs sm:text-sm whitespace-pre-wrap overflow-x-auto overflow-y-auto max-h-40 text-gray-700 break-all">
                              {JSON.stringify(event.data, null, 2)}
                            </pre>
                          </div>
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Metadatos:</p>
                              <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                <pre className="text-xs whitespace-pre-wrap overflow-x-auto overflow-y-auto max-h-20 text-gray-600 break-all">
                                  {JSON.stringify(event.metadata, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}