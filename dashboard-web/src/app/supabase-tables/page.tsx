'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseTablesPage() {
  const [tables, setTables] = useState<string[]>([]);
  const [tableSchema, setTableSchema] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [creatingTables, setCreatingTables] = useState<boolean>(false);

  // Fetch list of tables
  useEffect(() => {
    async function fetchTables() {
      try {
        setLoading(true);
        // This query lists all tables in the public schema
        const { data, error } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');

        if (error) throw error;
        
        // Extract table names and sort them
        const tableNames = data?.map(item => item.tablename).sort() || [];
        setTables(tableNames);
      } catch (error) {
        console.error('Error fetching tables:', error);
        setMessage(`Error fetching tables: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  // Fetch schema for a specific table
  const fetchTableSchema = async (tableName: string) => {
    if (!tableName) return;
    
    try {
      setLoading(true);
      setSelectedTable(tableName);
      
      // This query gets column information for the selected table
      const { data, error } = await supabase
        .from('pg_columns')
        .select('*')
        .eq('table_name', tableName)
        .order('ordinal_position');

      if (error) throw error;
      
      setTableSchema(data);
    } catch (error) {
      console.error(`Error fetching schema for ${tableName}:`, error);
      setMessage(`Error fetching schema: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Create Event Sourcing tables
  const createEventSourcingTables = async () => {
    try {
      setCreatingTables(true);
      setMessage('Creating Event Sourcing tables...');
      
      // Create events table
      const createEventsTableQuery = `
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          aggregate_type VARCHAR(255) NOT NULL,
          aggregate_id UUID NOT NULL,
          type VARCHAR(255) NOT NULL,
          payload JSONB NOT NULL,
          metadata JSONB,
          version INT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          created_by UUID
        );
        
        CREATE INDEX IF NOT EXISTS idx_events_aggregate_id ON events(aggregate_id);
        CREATE INDEX IF NOT EXISTS idx_events_aggregate_type ON events(aggregate_type);
        CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
        CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
        CREATE INDEX IF NOT EXISTS idx_events_aggregate_id_version ON events(aggregate_id, version);
      `;
      
      // Create snapshots table
      const createSnapshotsTableQuery = `
        CREATE TABLE IF NOT EXISTS snapshots (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          aggregate_type VARCHAR(255) NOT NULL,
          aggregate_id UUID NOT NULL,
          state JSONB NOT NULL,
          version INT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_snapshots_aggregate_id ON snapshots(aggregate_id);
        CREATE INDEX IF NOT EXISTS idx_snapshots_aggregate_type ON snapshots(aggregate_type);
        CREATE INDEX IF NOT EXISTS idx_snapshots_aggregate_id_version ON snapshots(aggregate_id, version);
      `;

      // Execute queries
      const { error: eventsError } = await supabase.rpc('execute_sql', { query: createEventsTableQuery });
      if (eventsError) throw new Error(`Error creating events table: ${eventsError.message}`);
      
      const { error: snapshotsError } = await supabase.rpc('execute_sql', { query: createSnapshotsTableQuery });
      if (snapshotsError) throw new Error(`Error creating snapshots table: ${snapshotsError.message}`);
      
      // Refresh table list
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

      if (error) throw error;
      
      // Extract table names and sort them
      const tableNames = data?.map(item => item.tablename).sort() || [];
      setTables(tableNames);
      
      setMessage('Event Sourcing tables created successfully!');
    } catch (error) {
      console.error('Error creating Event Sourcing tables:', error);
      setMessage(`Error creating tables: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCreatingTables(false);
    }
  };

  // Create tables using native SQL migration
  const createTablesWithMigration = async () => {
    try {
      setCreatingTables(true);
      setMessage('Creating Event Sourcing tables using migration...');
      
      // Fetch the SQL migration file content
      const response = await fetch('/api/get-migration-sql');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch migration SQL: ${response.statusText}`);
      }
      
      const migrationSql = await response.text();
      
      // Execute the migration
      const { error } = await supabase.rpc('execute_sql', { query: migrationSql });
      
      if (error) throw error;
      
      // Refresh table list
      const { data, error: listError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

      if (listError) throw listError;
      
      // Extract table names and sort them
      const tableNames = data?.map(item => item.tablename).sort() || [];
      setTables(tableNames);
      
      setMessage('Event Sourcing tables created successfully from migration!');
    } catch (error) {
      console.error('Error executing migration:', error);
      if (error instanceof Error && error.message.includes('function "execute_sql" does not exist')) {
        setMessage('Error: The "execute_sql" function is not available. You need to create this function in Supabase or use the SQL Editor in the Supabase dashboard to run the migration.');
      } else {
        setMessage(`Error creating tables: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setCreatingTables(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Supabase Tables Explorer</h1>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tables list */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tables</h2>
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
          
          {loading && tables.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Loading tables...</div>
          ) : tables.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No tables found in your database.</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <ul className="divide-y">
                {tables.map(table => (
                  <li 
                    key={table}
                    className={`py-2 px-3 cursor-pointer hover:bg-gray-100 ${selectedTable === table ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    onClick={() => fetchTableSchema(table)}
                  >
                    {table}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-6 space-y-3">
            <h3 className="font-medium">Missing Event Sourcing Tables?</h3>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              onClick={createEventSourcingTables}
              disabled={creatingTables}
            >
              {creatingTables ? 'Creating...' : 'Create Event Sourcing Tables'}
            </button>
            <p className="text-xs text-gray-500">
              Creates the <code>events</code> and <code>snapshots</code> tables needed for Event Sourcing
            </p>
          </div>
        </div>
        
        {/* Table schema */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            {selectedTable ? `Schema: ${selectedTable}` : 'Select a table to view its schema'}
          </h2>
          
          {selectedTable && loading ? (
            <div className="text-gray-500 text-center py-8">Loading schema...</div>
          ) : selectedTable && tableSchema ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Column</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Nullable</th>
                    <th className="px-4 py-2 text-left">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {tableSchema.map((column: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2 font-medium">{column.column_name}</td>
                      <td className="px-4 py-2">{column.data_type}</td>
                      <td className="px-4 py-2">{column.is_nullable === 'YES' ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2">{column.column_default || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedTable ? (
            <div className="text-gray-500 text-center py-8">No schema information available.</div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Select a table from the list to view its schema details.
            </div>
          )}
          
          {/* Event Sourcing tables creation guide */}
          {(!tables.includes('events') || !tables.includes('snapshots')) && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800 mb-2">Event Sourcing Tables Not Found</h3>
              <p className="text-sm text-yellow-700 mb-4">
                Your database is missing the necessary tables for Event Sourcing. Click the "Create Event Sourcing Tables" 
                button on the left to set them up automatically.
              </p>
              <p className="text-sm text-yellow-700">
                You need two main tables:
              </p>
              <ul className="list-disc pl-5 text-sm text-yellow-700 mt-2 mb-4">
                <li><code>events</code> - Stores all domain events</li>
                <li><code>snapshots</code> - Stores aggregate state snapshots for performance</li>
              </ul>
              <p className="text-xs text-yellow-600">
                If the automatic creation doesn't work, you can manually run the SQL migration in the Supabase dashboard SQL Editor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}