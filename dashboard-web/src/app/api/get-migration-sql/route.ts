import { NextResponse } from 'next/server';

export async function GET() {
  // This is the migration SQL to create Event Sourcing tables
  const migrationSql = `
-- Event Sourcing Tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table to store all domain events
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

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_events_aggregate_id ON events(aggregate_id);
CREATE INDEX IF NOT EXISTS idx_events_aggregate_type ON events(aggregate_type);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_aggregate_id_version ON events(aggregate_id, version);

-- Snapshots table for performance optimization
CREATE TABLE IF NOT EXISTS snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aggregate_type VARCHAR(255) NOT NULL,
  aggregate_id UUID NOT NULL,
  state JSONB NOT NULL,
  version INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_aggregate_id ON snapshots(aggregate_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_aggregate_type ON snapshots(aggregate_type);
CREATE INDEX IF NOT EXISTS idx_snapshots_aggregate_id_version ON snapshots(aggregate_id, version);

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Enable read access for authenticated users" ON events
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable insert for authenticated users" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Snapshots policies
CREATE POLICY "Enable read access for authenticated users" ON snapshots
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable insert/update for authenticated users" ON snapshots
  FOR ALL USING (auth.role() = 'authenticated');
  `;

  return new NextResponse(migrationSql, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}