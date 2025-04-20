# Database Migrations

This directory contains SQL migration scripts for the database schema.

## Available Migrations

### add_birthday_field.sql

This migration adds the `birthday` field to the `users` table in the Supabase database.

**How to apply this migration:**

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the `add_birthday_field.sql` file
4. Paste the SQL into the editor
5. Execute the SQL query

**Changes made by this migration:**

- Adds a `birthday` column of type `DATE` to the `users` table
- The column is nullable (users without birthdates will have NULL values)
- Existing users can have their birthday added later via the UI

**Affected components:**

- User Management UI (now displays birthday field)
- User creation and editing forms
- User profile data normalization

After applying this migration, ensure the application is using the latest code that handles the birthday field properly.