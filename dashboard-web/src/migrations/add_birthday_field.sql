-- Migration to add the birthday field to the users table
-- Execute this SQL in the Supabase SQL editor to add the birthday field to existing tables

-- Add birthday column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS birthday DATE;

-- Output success message
SELECT 'Birthday column added to users table' as message;