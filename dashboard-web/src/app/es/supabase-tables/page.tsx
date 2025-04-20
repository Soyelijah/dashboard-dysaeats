'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase/client';

export default function SupabaseTablesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState<string[]>([]);
  const [tableSchema, setTableSchema] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [creatingTables, setCreatingTables] = useState<boolean>(false);

  // Proteger ruta - redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/es/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch list of all tables in the database
  useEffect(() => {
    async function fetchTables() {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setMessage('Obteniendo lista de tablas...');
        
        // This query gets all tables in the public schema from pg_tables
        const { data: pgTablesData, error: pgTablesError } = await supabase
          .rpc('get_all_tables');
        
        if (pgTablesError) {
          console.error('Error using RPC function:', pgTablesError);
          // Fall back to hardcoded list if RPC fails
          throw new Error('RPC fallback needed');
        }
        
        // If we successfully got tables from RPC
        if (pgTablesData && Array.isArray(pgTablesData)) {
          const tablesList = pgTablesData.map(table => table.tablename);
          setTables(tablesList.sort());
          setMessage('');
          setLoading(false);
          return;
        }
        
        // Fallback: Try with direct SQL query using the system view
        const { data: directQueryData, error: directQueryError } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');
        
        if (!directQueryError && directQueryData) {
          const tablesList = directQueryData.map(table => table.tablename);
          setTables(tablesList.sort());
          setMessage('');
          setLoading(false);
          return;
        }
        
        // Second fallback: Check a predefined list of known tables
        console.warn('Falling back to predefined table list');
        
        const knownTables = [
          'events', 'snapshots', 'users', 'profiles', 
          'restaurants', 'orders', 'order_items', 
          'products', 'categories', 'menu_items',
          'menu_categories', 'reviews', 'payments',
          'deliveries', 'notifications', 'audit_logs',
          'comments', 'favorites', 'promotions',
          'reservations', 'user_preferences', 'transactions',
          'delivery_zones', 'restaurant_hours', 'tags',
          'images', 'addresses', 'carts', 'cart_items'
        ];
        
        // Test each table to see if it exists
        const tablesList: string[] = [];
        
        for (const table of knownTables) {
          try {
            const { error } = await supabase
              .from(table)
              .select('*')
              .limit(1);
            
            // If no error, add to list
            if (!error || error.code !== '42P01') { // 42P01 is "table does not exist"
              tablesList.push(table);
            }
          } catch (e) {
            // Ignore errors
          }
        }
        
        setTables(tablesList.sort());
      } catch (error) {
        console.error('Error fetching tables:', error);
        
        // Last resort: hardcoded list of most common tables
        const fallbackTables = [
          'events', 'snapshots', 'users', 'profiles', 
          'restaurants', 'orders', 'order_items', 
          'products', 'categories'
        ];
        
        setTables(fallbackTables);
        setMessage(`Mostrando lista predefinida de tablas. Error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, [isAuthenticated]);

  // Mostrar cargador mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Fetch schema for a specific table
  const fetchTableSchema = async (tableName: string) => {
    if (!tableName) return;
    
    try {
      setLoading(true);
      setSelectedTable(tableName);
      setMessage('Obteniendo estructura de la tabla...');
      
      // First try: Use the RPC function to get table columns
      const { data: rpcColumnData, error: rpcColumnError } = await supabase
        .rpc('get_table_columns', { table_name: tableName });
        
      if (!rpcColumnError && rpcColumnData && rpcColumnData.length > 0) {
        // Successful RPC call
        setTableSchema(rpcColumnData);
        setMessage('');
        setLoading(false);
        return;
      }
      
      // Second try: Query information_schema.columns directly
      const { data: infoSchemaData, error: infoSchemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');
        
      if (!infoSchemaError && infoSchemaData && infoSchemaData.length > 0) {
        setTableSchema(infoSchemaData);
        setMessage('');
        setLoading(false);
        return;
      }
      
      // Third try: Query table and column data directly from Supabase metadata tables
      try {
        const { data: metadataColumns, error: metadataError } = await supabase
          .from('_metadata_tables')
          .select('columns')
          .eq('name', tableName)
          .maybeSingle();
          
        if (!metadataError && metadataColumns && metadataColumns.columns) {
          // Convert metadata format to our schema format
          const columnsSchema = Object.entries(metadataColumns.columns).map(([key, value]: [string, any]) => {
            return {
              column_name: key,
              data_type: value.type || 'UNKNOWN',
              is_nullable: value.nullable ? 'YES' : 'NO',
              column_default: value.default_value || null,
              description: value.comment || null
            };
          });
          
          setTableSchema(columnsSchema);
          setMessage('Estructura obtenida de metadatos de Supabase');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Error accessing metadata tables:', e);
        // Continue to next method if this fails
      }
      
      // Fourth try: Get column definitions directly from PostgreSQL information_schema
      try {
        // Use raw query to access PostgreSQL's information_schema
        const { data: pgColumnsData, error: pgColumnsError } = await supabase
          .rpc('execute_sql_with_result', {
            query: `
              SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default,
                col_description(
                  (table_schema || '.' || table_name)::regclass::oid, 
                  ordinal_position
                ) as description
              FROM 
                information_schema.columns 
              WHERE 
                table_schema = 'public' AND 
                table_name = '${tableName}'
              ORDER BY 
                ordinal_position
            `
          });
        
        if (!pgColumnsError && pgColumnsData && pgColumnsData.length > 0) {
          setTableSchema(pgColumnsData);
          setMessage('Estructura obtenida directamente de PostgreSQL');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Error getting schema from PostgreSQL information_schema:', e);
        // Continue to next method if this fails
      }
          
      // Fifth try: Query the table and infer schema from results
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(10);  // Try to get more rows for better type inference
          
        if (!error && data && data.length > 0) {
          // Extract schema from all fetched rows
          const mergedSchema = new Map();
          
          data.forEach(row => {
            Object.entries(row).forEach(([key, value]) => {
              if (!mergedSchema.has(key)) {
                let dataType = typeof value;
                
                // Better type detection
                if (value === null) {
                  dataType = 'NULL';
                } else if (Array.isArray(value)) {
                  dataType = 'ARRAY';
                } else if (dataType === 'object') {
                  if (value instanceof Date) {
                    dataType = 'TIMESTAMP';
                  } else {
                    dataType = 'JSON/JSONB';
                  }
                } else if (dataType === 'number') {
                  dataType = Number.isInteger(value) ? 'INTEGER' : 'NUMERIC';
                } else if (dataType === 'string') {
                  // Try to detect if it's a UUID
                  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
                    dataType = 'UUID';
                  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    dataType = 'TIMESTAMP';
                  } else {
                    dataType = 'VARCHAR';
                  }
                }
                
                // For each key, check if all rows have the same type
                let isNullable = false;
                
                // Check if the column is nullable by looking at all values
                data.forEach(r => {
                  if (r[key] === null) {
                    isNullable = true;
                  }
                });
                
                mergedSchema.set(key, {
                  column_name: key,
                  data_type: dataType,
                  is_nullable: isNullable ? 'YES' : 'NO',
                  column_default: 'UNKNOWN',
                  description: null
                });
              }
            });
          });
          
          const schema = Array.from(mergedSchema.values());
          setTableSchema(schema);
          setMessage('Estructura inferida de datos existentes');
          setLoading(false);
          return;
        } else {
          throw new Error('No data available');
        }
      } catch (e) {
        console.warn(`Error inferring schema from data: ${e}`);
        
        // Last resort: Create a generic schema message
        setTableSchema([
          { column_name: 'No se pudo determinar la estructura completa', data_type: '⚠️', is_nullable: '⚠️', column_default: '⚠️' },
          { column_name: 'Intente usar SQL Editor en Supabase', data_type: 'para ver', is_nullable: 'la estructura', column_default: 'completa' },
        ]);
        setMessage(`No se pudo obtener información detallada para la tabla "${tableName}". Esto puede deberse a permisos insuficientes o a que la tabla está vacía.`);
        setLoading(false);
      }
    } catch (error) {
      console.error(`Error fetching schema for ${tableName}:`, error);
      setMessage(`Error al obtener esquema: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Create Event Sourcing tables
  const createEventSourcingTables = async () => {
    try {
      setCreatingTables(true);
      setMessage('Creando tablas de Event Sourcing...');
      
      // Instead of trying to execute SQL directly, let's use the SQL API endpoint
      // First, redirect user to the SQL creation page with instructions
      const apiPath = '/api/get-migration-sql';
      
      try {
        const response = await fetch(apiPath);
        const sql = await response.text();
        
        // Display the SQL with instructions
        const sqlViewerUrl = 'https://supabase.com/dashboard/project/_/sql/new';
        
        setMessage(`
          Para crear tablas de Event Sourcing, necesitas ejecutar este SQL en el Editor SQL de Supabase.
          
          1. Ve a ${sqlViewerUrl}
          2. Pega el siguiente SQL:
          
          ${sql}
          
          3. Haz clic en "Run" o ejecuta el SQL
          4. Vuelve a esta página y refresca para ver las tablas creadas
        `);
        
        // Update tables list
        // Check if tables exist now
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if we can access the events table
        const { error: eventsError } = await supabase
          .from('events')
          .select('id')
          .limit(1);
        
        // Check if we can access the snapshots table
        const { error: snapshotsError } = await supabase
          .from('snapshots')
          .select('id')
          .limit(1);
        
        const tablesList = [...tables];
        
        // Add tables to our list if we can access them
        if (!eventsError && !tablesList.includes('events')) {
          tablesList.push('events');
        }
        
        if (!snapshotsError && !tablesList.includes('snapshots')) {
          tablesList.push('snapshots');
        }
        
        setTables(tablesList.sort());
      } catch (apiError) {
        throw new Error(`Error al obtener SQL para migración: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`);
      }
    } catch (error) {
      console.error('Error creating Event Sourcing tables:', error);
      setMessage(`Error al crear tablas: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setCreatingTables(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Explorador de Tablas Supabase</h1>
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
            <p className="text-blue-100 mt-2">Gestiona las tablas de Supabase para Event Sourcing y visualiza su estructura</p>
          </div>
        </div>
        
        {/* Message display */}
        {message && (
          <div className={`p-6 mb-6 rounded-lg shadow-md ${message.includes('Error') ? 'bg-red-50 border border-red-100 text-red-700' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {message.includes('Error') ? (
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <pre className="whitespace-pre-wrap text-sm">{message}</pre>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tables list */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-semibold text-gray-800">Tablas</h2>
              <button
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                onClick={() => window.location.reload()}
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refrescar
              </button>
            </div>
            
            {loading && tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600">Cargando tablas...</p>
              </div>
            ) : tables.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-600 mb-2">No se encontraron tablas en la base de datos</p>
                <p className="text-sm text-gray-500">Asegúrate de que tu conexión a Supabase esté configurada correctamente</p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {tables.map(table => (
                    <li 
                      key={table}
                      className={`py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTable === table ? 'bg-blue-50 border-l-4 border-blue-500 pl-3' : ''}`}
                      onClick={() => fetchTableSchema(table)}
                    >
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        <span className={`${selectedTable === table ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                          {table}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-8 bg-indigo-50 p-5 rounded-lg border border-indigo-100">
              <h3 className="font-medium text-indigo-800 mb-3 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tablas de Event Sourcing
              </h3>
              <p className="text-sm text-indigo-700 mb-4">
                Para implementar Event Sourcing, necesitas tablas específicas en tu base de datos.
              </p>
              <button
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                onClick={createEventSourcingTables}
                disabled={creatingTables}
              >
                {creatingTables ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Crear tablas Event Sourcing
                  </>
                )}
              </button>
              <p className="text-xs text-indigo-500 mt-3">
                Crea las tablas <code className="bg-indigo-100 px-1 py-0.5 rounded">events</code> y <code className="bg-indigo-100 px-1 py-0.5 rounded">snapshots</code> necesarias para Event Sourcing
              </p>
            </div>
          </div>
          
          {/* Table schema */}
          <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3 text-gray-800">
              {selectedTable ? (
                <div className="flex items-center">
                  <span>Estructura de la tabla:</span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedTable}
                  </span>
                </div>
              ) : (
                'Selecciona una tabla para ver su estructura'
              )}
            </h2>
            
            {selectedTable && loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600">Cargando estructura...</p>
              </div>
            ) : selectedTable && tableSchema && tableSchema.length > 0 ? (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Columna
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nullable
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Default
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tableSchema.map((column: any, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {column.column_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                              {column.data_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {column.is_nullable === 'YES' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700">
                                Sí
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700">
                                No
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {column.column_default ? (
                              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">
                                {column.column_default}
                              </code>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {column.description ? (
                              <span className="text-xs text-gray-700">
                                {column.description}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedTable ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 mb-2">No hay información de estructura disponible</p>
                <p className="text-sm text-gray-500">No se pudo obtener la información de columnas para esta tabla</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
                <p className="text-gray-600 mb-2">Selecciona una tabla</p>
                <p className="text-sm text-gray-500">Haz clic en una tabla de la lista a la izquierda para ver su estructura</p>
              </div>
            )}
            
            {/* Event Sourcing tables creation guide */}
            {(!tables.includes('events') || !tables.includes('snapshots')) && (
              <div className="mt-8 p-5 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-amber-800 mb-2">No se encontraron tablas de Event Sourcing</h3>
                    <p className="text-sm text-amber-700 mb-4">
                      Tu base de datos no tiene las tablas necesarias para Event Sourcing. Haz clic en el botón "Crear tablas Event Sourcing" 
                      a la izquierda para configurarlas automáticamente.
                    </p>
                    <div className="text-sm text-amber-700">
                      <p className="font-medium">Necesitas dos tablas principales:</p>
                      <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
                        <li><code className="bg-amber-100 px-1 py-0.5 rounded font-mono">events</code> - Almacena todos los eventos de dominio</li>
                        <li><code className="bg-amber-100 px-1 py-0.5 rounded font-mono">snapshots</code> - Almacena snapshots del estado de los agregados para rendimiento</li>
                      </ul>
                      <p className="text-xs text-amber-600">
                        Si la creación automática no funciona, puedes ejecutar manualmente la migración SQL en el Editor SQL del dashboard de Supabase.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}