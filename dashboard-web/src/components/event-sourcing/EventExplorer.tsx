'use client';

import { useState, useEffect, Fragment } from 'react';
import { supabase } from '@/services/supabase/client';
import { eventStore } from '@/services/supabase/eventStore';

// Definir tipos básicos
interface Event {
  id: string;
  aggregate_id: string;
  aggregate_type: string;
  type: string;
  data: any;
  version: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export default function EventExplorer() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [aggregateTypes, setAggregateTypes] = useState<string[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [selectedAggregateType, setSelectedAggregateType] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Estado para selección múltiple
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  
  // Estado para filas expandidas en vista móvil
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  
  // Estado para determinar si estamos en modo móvil (50% del ancho original)
  const [isCompactView, setIsCompactView] = useState(false);
  
  // Estados para controlar los estados de "Copiado" de los botones
  const [dataCopied, setDataCopied] = useState(false);
  const [metadataCopied, setMetadataCopied] = useState(false);
  
  // Función para copiar al portapapeles y actualizar el estado del botón
  const copyToClipboard = (text: string, type: 'data' | 'metadata') => {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (type === 'data') {
          setDataCopied(true);
        } else {
          setMetadataCopied(true);
        }
        
        // Restablecer el estado del botón después de 2 segundos
        setTimeout(() => {
          if (type === 'data') {
            setDataCopied(false);
          } else {
            setMetadataCopied(false);
          }
        }, 2000);
      })
      .catch(err => console.error('Error al copiar:', err));
  };
  
  // Efectos para detectar el 50% del tamaño original y ajustar la vista
  useEffect(() => {
    // Función para determinar si la pantalla está en modo compacto
    const checkScreenSize = () => {
      // Asumimos que el ancho original es la pantalla completa
      const originalWidth = window.screen.width;
      // El ancho actual de la ventana
      const currentWidth = window.innerWidth;
      // Si estamos por debajo del 50% del ancho original, activamos la vista compacta
      setIsCompactView(currentWidth < originalWidth * 0.5);
    };

    // Verificar al cargar inicialmente
    checkScreenSize();
    
    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkScreenSize);
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Cargar eventos
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (error) throw error;
        
        // Asegurarse de que cada evento tenga un campo 'data' que contenga el payload
        const eventsWithData = (data || []).map(event => ({
          ...event,
          data: event.payload  // Asignar el campo payload a data para el frontend
        }));
        setEvents(eventsWithData);
        
        // Extraer tipos únicos de agregados y eventos
        if (data) {
          const uniqueAggregateTypes = [...new Set(data.map(event => event.aggregate_type))];
          const uniqueEventTypes = [...new Set(data.map(event => event.type))];
          
          setAggregateTypes(uniqueAggregateTypes);
          setEventTypes(uniqueEventTypes);
        }
      } catch (err) {
        console.error('Error al cargar eventos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
    
    // Suscribirse a nuevos eventos
    const subscription = supabase
      .channel('events-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'events' 
      }, (payload) => {
        const rawEvent = payload.new as Event;
        // Asegurarse de que el nuevo evento tenga un campo 'data'
        const newEvent = {
          ...rawEvent,
          data: rawEvent.payload // Asignar el campo payload a data para el frontend
        };
        setEvents(prevEvents => [newEvent, ...prevEvents]);
        
        // Actualizar tipos de agregados y eventos si es necesario
        setAggregateTypes(prev => 
          prev.includes(newEvent.aggregate_type) 
            ? prev 
            : [...prev, newEvent.aggregate_type]
        );
        
        setEventTypes(prev => 
          prev.includes(newEvent.type) 
            ? prev 
            : [...prev, newEvent.type]
        );
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  
  // Aplicar filtros
  useEffect(() => {
    let result = [...events];
    
    // Filtrar por tipo de agregado
    if (selectedAggregateType !== 'all') {
      result = result.filter(event => event.aggregate_type === selectedAggregateType);
    }
    
    // Filtrar por tipo de evento
    if (selectedEventType !== 'all') {
      result = result.filter(event => event.type === selectedEventType);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      result = result.filter(event => 
        JSON.stringify(event).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredEvents(result);
    
    // Resetear selección múltiple cuando cambian los filtros
    setSelectedEvents([]);
    setSelectAllChecked(false);
  }, [events, selectedAggregateType, selectedEventType, searchTerm]);
  
  const resetFilters = () => {
    setSelectedAggregateType('all');
    setSelectedEventType('all');
    setSearchTerm('');
  };
  
  const replayEvent = async (event: Event) => {
    try {
      // Esta es una reproducción simplificada - en una aplicación real, tendrías
      // lógica más sofisticada para manejar la reproducción de eventos
      // y actualizar los agregados relacionados
      
      // Verificar que data no sea null o undefined antes de enviarlo
      if (!event.data) {
        console.error('Error: Los datos del evento están vacíos');
        alert('Error al reproducir evento: Los datos del evento están vacíos');
        return;
      }
      
      // Asegurarse de pasar una copia de los datos para evitar problemas de referencia
      await eventStore.saveEvent({
        aggregate_id: event.aggregate_id,
        aggregate_type: event.aggregate_type,
        version: event.version + 1000, // Evitar conflictos de versión
        type: `Replay${event.type}`,
        data: JSON.parse(JSON.stringify(event.data)), // Crear una copia profunda de los datos
        metadata: {
          ...event.metadata,
          replayed: true,
          original_event_id: event.id,
          replay_timestamp: new Date().toISOString()
        }
      });
      
      alert('Evento reproducido correctamente');
    } catch (error) {
      console.error('Error al reproducir evento:', error);
      alert('Error al reproducir evento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const deleteEvent = async (event: Event) => {
    if (!event.id) {
      alert('Error: No se puede eliminar un evento sin ID');
      return;
    }

    // Confirmar antes de eliminar
    if (!confirm(`¿Estás seguro de que deseas eliminar este evento de tipo "${event.type}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Verificar primero si el evento existe
      const { data: checkEvent } = await supabase
        .from('events')
        .select('id')
        .eq('id', event.id)
        .single();
      
      if (!checkEvent) {
        alert('Error: Este evento ya no existe en la base de datos');
        return;
      }
      
      // Ejecutar borrado en la base de datos
      const success = await eventStore.deleteEvent(event.id);
      
      if (!success) {
        alert('No se pudo eliminar el evento. Verifica los permisos de la base de datos.');
        return;
      }
      
      // Recargar eventos para asegurarnos de que la UI refleje el estado actual de la BD
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      // Actualizar estado con eventos actualizados
      const eventsWithData = (data || []).map(event => ({
        ...event,
        data: event.payload
      }));
      
      // Actualizar el estado local de eventos para reflejar los cambios
      setEvents(eventsWithData);
      
      // Si el evento eliminado es el que está seleccionado, deseleccionar
      if (selectedEvent && selectedEvent.id === event.id) {
        setSelectedEvent(null);
      }
      
      // Eliminar de la selección múltiple si estaba seleccionado
      if (selectedEvents.includes(event.id)) {
        setSelectedEvents(prev => prev.filter(id => id !== event.id));
      }
      
      alert('Evento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      alert('Error al eliminar evento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };
  
  // Función para eliminar múltiples eventos seleccionados
  const deleteSelectedEvents = async () => {
    if (selectedEvents.length === 0) {
      alert('No hay eventos seleccionados para eliminar');
      return;
    }
    
    // Confirmar antes de eliminar múltiples eventos
    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedEvents.length} evento(s)? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      // Contador para eventos eliminados exitosamente
      let deletedCount = 0;
      
      // Eliminar cada evento seleccionado - Crear una copia del array para evitar problemas
      const eventsToDelete = [...selectedEvents];
      
      // Usar Promise.all para eliminar todos los eventos en paralelo
      await Promise.all(eventsToDelete.map(async (eventId) => {
        try {
          // Verificar primero si el evento existe
          const { data: checkEvent } = await supabase
            .from('events')
            .select('id')
            .eq('id', eventId)
            .single();
            
          if (checkEvent) {
            const success = await eventStore.deleteEvent(eventId);
            if (success) deletedCount++;
          } else {
            console.warn(`El evento con ID ${eventId} no existe en la base de datos`);
          }
        } catch (error) {
          console.error(`Error al eliminar evento ${eventId}:`, error);
        }
      }));
      
      // Recargar eventos usando RLS (Row Level Security) directo desde la base de datos
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Actualizar estado con eventos actualizados
      const eventsWithData = (data || []).map(event => ({
        ...event,
        data: event.payload
      }));
      
      // Actualizar el estado local de eventos para reflejar los cambios
      setEvents(eventsWithData);
      
      // Si el evento eliminado es el que está seleccionado para detalles, deseleccionar
      if (selectedEvent && eventsToDelete.includes(selectedEvent.id)) {
        setSelectedEvent(null);
      }
      
      // Limpiar selección
      setSelectedEvents([]);
      setSelectAllChecked(false);
      
      // Mostrar resultado al usuario
      if (deletedCount > 0) {
        alert(`${deletedCount} evento(s) eliminado(s) correctamente${deletedCount < eventsToDelete.length ? '. Algunos eventos no pudieron ser eliminados.' : '.'}`);
      } else {
        alert('No se pudo eliminar ningún evento. Verifica los permisos de la base de datos.');
      }
    } catch (error) {
      console.error('Error al eliminar eventos seleccionados:', error);
      alert('Error al eliminar eventos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };
  
  // Manejo de selección múltiple
  const toggleSelectEvent = (eventId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedEvents(prev => [...prev, eventId]);
    } else {
      setSelectedEvents(prev => prev.filter(id => id !== eventId));
    }
  };
  
  // Seleccionar/deseleccionar todos
  const toggleSelectAll = (isChecked: boolean) => {
    setSelectAllChecked(isChecked);
    if (isChecked) {
      // Seleccionar todos los eventos filtrados
      setSelectedEvents(filteredEvents.map(event => event.id));
    } else {
      // Deseleccionar todos
      setSelectedEvents([]);
    }
  };
  
  // Función para alternar la expansión de una fila en vista móvil
  const toggleRowExpansion = (eventId: string) => {
    setExpandedRows(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error}</p>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className={`flex flex-col ${isCompactView ? 'flex-col' : 'flex-row items-center justify-between'} mb-6`}>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Explorador de Eventos
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Visualiza, filtra, reproduce y elimina eventos del sistema
          </p>
        </div>
        <div className={`mt-3 ${isCompactView ? 'mt-3' : 'mt-0'} flex items-center space-x-2`}>
          <div className="bg-blue-50 text-blue-800 text-xs rounded-full px-3 py-1 flex items-center shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
            <span className="font-medium">Total: {events.length} eventos</span>
          </div>
          <div className="bg-green-50 text-green-800 text-xs rounded-full px-3 py-1 flex items-center shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
            <span className="font-medium">Filtrados: {filteredEvents.length} eventos</span>
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center">
            <svg className="h-4 w-4 mr-1.5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros y Búsqueda
          </h2>
          <button 
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center transition-colors"
            onClick={resetFilters}
          >
            <svg className="h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reiniciar filtros
          </button>
        </div>
        <div className={`grid grid-cols-1 ${isCompactView ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Agregado</label>
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 bg-gray-50"
              value={selectedAggregateType}
              onChange={(e) => setSelectedAggregateType(e.target.value)}
            >
              <option value="all">Todos los Tipos</option>
              {aggregateTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedAggregateType === 'all' 
                ? 'Mostrando todos los agregados' 
                : `Filtrando por agregado "${selectedAggregateType}"`}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Evento</label>
            <select 
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 bg-gray-50"
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
            >
              <option value="all">Todos los Eventos</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedEventType === 'all' 
                ? 'Mostrando todos los eventos' 
                : `Filtrando por evento "${selectedEventType}"`}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Buscar por Texto</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text"
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 bg-gray-50"
                placeholder="Buscar en evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {searchTerm 
                ? `Buscando "${searchTerm}" en todos los campos` 
                : 'Ingresa texto para buscar en todos los campos'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Modo compacto (50% del ancho original): Pestañas para alternar entre eventos y detalles */}
      <div className={`${!isCompactView ? 'hidden' : ''} mb-4`}>
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-center ${!selectedEvent ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setSelectedEvent(null)}
          >
            Eventos ({filteredEvents.length})
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center ${selectedEvent ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => selectedEvent && setSelectedEvent(selectedEvent)}
            disabled={!selectedEvent}
          >
            Detalles
          </button>
        </div>
      </div>
      
      {/* Barra de acciones para selección múltiple */}
      {selectedEvents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <span className="text-sm text-blue-800 font-medium mr-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {selectedEvents.length} evento(s) seleccionado(s)
            </span>
          </div>
          <button
            onClick={deleteSelectedEvents}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md px-3 py-1.5 flex items-center shadow-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar seleccionados
          </button>
        </div>
      )}

      <div className={`flex ${isCompactView ? 'flex-col' : 'flex-row'} gap-4`}>
        {/* Lista de Eventos - En vista compacta se oculta cuando hay un evento seleccionado */}
        <div className={`w-full ${isCompactView ? 'w-full' : 'w-1/2'} ${selectedEvent && isCompactView ? 'hidden' : ''}`}>
          <h2 className={`text-lg font-semibold mb-3 ${isCompactView ? 'hidden' : 'flex'} items-center`}>
            <svg className="w-5 h-5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Eventos ({filteredEvents.length})
          </h2>
          
          {filteredEvents.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-gray-500 text-center shadow-sm">
              <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium mb-1">No se encontraron eventos</p>
              <p className="text-xs">No se encontraron eventos que coincidan con los filtros actuales</p>
            </div>
          ) : (
            <>
              {/* Tabla responsive con Tailwind que imita el comportamiento de Bootstrap */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="w-10 px-3 py-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={selectAllChecked}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                          />
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className={`${isCompactView ? 'hidden' : 'table-cell'} px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                        Agregado
                      </th>
                      <th scope="col" className={`${isCompactView ? 'hidden' : 'table-cell'} px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map(event => {
                      const isExpanded = expandedRows.includes(event.id);
                      return (
                        <Fragment key={event.id}>
                          <tr 
                            className={`hover:bg-gray-50 transition-colors ${selectedEvent?.id === event.id ? 'bg-blue-50' : ''} ${selectedEvents.includes(event.id) ? 'bg-blue-50' : ''}`}
                          >
                            <td className="px-3 py-3">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  checked={selectedEvents.includes(event.id)}
                                  onChange={(e) => toggleSelectEvent(event.id, e.target.checked)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-gray-900">
                              <div className="flex items-center">
                                <button 
                                  type="button" 
                                  className={`${!isCompactView ? 'hidden' : ''} mr-2 focus:outline-none`}
                                  onClick={() => toggleRowExpansion(event.id)}
                                >
                                  <svg 
                                    className={`h-4 w-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                <div>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {event.type}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-500">v{event.version}</span>
                                </div>
                              </div>
                            </td>
                            <td className={`${isCompactView ? 'hidden' : 'table-cell'} px-4 py-3 text-xs text-gray-500`}>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {event.aggregate_type}
                              </span>
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {new Date(event.created_at).toLocaleString()}
                              </div>
                            </td>
                            <td className={`${isCompactView ? 'hidden' : 'table-cell'} px-4 py-3 text-xs text-gray-500 text-right`}>
                              <div className="flex items-center justify-end space-x-2">
                                <button 
                                  type="button"
                                  className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteEvent(event);
                                  }}
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Eliminar
                                </button>
                                <button 
                                  type="button"
                                  className="inline-flex items-center px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(event);
                                  }}
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  Detalles
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Fila expandible en vista compacta */}
                          {isExpanded && (
                            <tr className={`${!isCompactView ? 'hidden' : ''} bg-gray-50`}>
                              <td colSpan={2} className="px-4 py-3 text-xs">
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-gray-500 font-medium">Agregado:</span> 
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {event.aggregate_type}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 font-medium">Creado:</span> 
                                    <span className="ml-2 text-xs text-gray-600">
                                      {new Date(event.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200 flex justify-between">
                                    <div className="flex space-x-2 mt-2">
                                      <button 
                                        type="button"
                                        className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteEvent(event);
                                        }}
                                      >
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Eliminar
                                      </button>
                                      <button 
                                        type="button"
                                        className="inline-flex items-center px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedEvent(event);
                                        }}
                                      >
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Detalles
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        
        {/* Detalles del Evento - En vista compacta se muestra solo cuando hay un evento seleccionado */}
        <div className={`w-full ${isCompactView ? 'w-full' : 'w-1/2'} ${!selectedEvent && isCompactView ? 'hidden' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold flex items-center">
              <svg className="w-5 h-5 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Detalles del Evento
            </h2>
            {/* Botón de volver (solo en vista compacta) */}
            {selectedEvent && isCompactView && (
              <button 
                className="text-blue-500 flex items-center transition-colors"
                onClick={() => setSelectedEvent(null)}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
            )}
          </div>
          
          {selectedEvent ? (
            <div className="border rounded-lg p-5 shadow-md bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 -m-5 mb-5 p-5 border-b">
                <div className={`flex flex-col ${isCompactView ? 'flex-col' : 'flex-row'} justify-between items-start ${isCompactView ? 'items-start' : 'items-center'}`}>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {selectedEvent.type}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 mr-2">
                        {selectedEvent.aggregate_type}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="ml-2">Versión: {selectedEvent.version}</span>
                    </div>
                  </div>
                  <div className={`flex mt-3 ${isCompactView ? 'mt-3' : 'mt-0'} gap-2`}>
                    <button 
                      className="inline-flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors shadow-sm"
                      onClick={() => deleteEvent(selectedEvent)}
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar Evento
                    </button>
                    <button 
                      className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors shadow-sm"
                      onClick={() => {
                        const eventToReplay = {
                          ...selectedEvent,
                          data: selectedEvent.data || selectedEvent.payload
                        };
                        replayEvent(eventToReplay);
                      }}
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reproducir
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`grid grid-cols-1 ${isCompactView ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mb-6`}>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-700 border-b pb-2 mb-2">Información del Evento</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 font-medium">Fecha de Creación:</span>
                      <div className="bg-white p-2 mt-1 rounded-md border border-gray-200">
                        <span className="text-sm text-gray-800">{new Date(selectedEvent.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Versión:</span>
                      <div className="bg-white p-2 mt-1 rounded-md border border-gray-200">
                        <span className="text-base font-semibold text-gray-800">{selectedEvent.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-700 border-b pb-2 mb-2">Identificadores</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 font-medium">ID del Evento:</span>
                      <div className="bg-white p-2 mt-1 rounded-md border border-gray-200 overflow-x-auto">
                        <span className="text-sm font-mono text-gray-800 break-all">{selectedEvent.id}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">ID del Agregado:</span>
                      <div className="bg-white p-2 mt-1 rounded-md border border-gray-200 overflow-x-auto">
                        <span className="text-sm font-mono text-gray-800 break-all">{selectedEvent.aggregate_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
                <div className="flex justify-between items-center border-b pb-2 mb-3">
                  <h4 className="font-semibold text-gray-700">Datos del Evento</h4>
                  <button 
                    className={`inline-flex items-center text-xs px-2 py-1 ${
                      dataCopied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    } rounded transition-colors`}
                    onClick={() => copyToClipboard(JSON.stringify(selectedEvent.data, null, 2), 'data')}
                    disabled={dataCopied}
                  >
                    {dataCopied ? (
                      <>
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Copiado
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copiar JSON
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 overflow-auto max-h-96 shadow-inner">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all font-mono">
                    {JSON.stringify(selectedEvent.data, null, 2)}
                  </pre>
                </div>
              </div>
              
              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <h4 className="font-semibold text-gray-700">Metadatos</h4>
                    <button 
                      className={`inline-flex items-center text-xs px-2 py-1 ${
                        metadataCopied 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      } rounded transition-colors`}
                      onClick={() => copyToClipboard(JSON.stringify(selectedEvent.metadata, null, 2), 'metadata')}
                      disabled={metadataCopied}
                    >
                      {metadataCopied ? (
                        <>
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Copiado
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copiar JSON
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 overflow-auto max-h-64 shadow-inner">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all font-mono">
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-8 bg-white text-center shadow-sm flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay evento seleccionado</h3>
              <p className="text-gray-500 max-w-md">Haz clic en el botón "Detalles" de cualquier evento en la lista para ver su información completa aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}