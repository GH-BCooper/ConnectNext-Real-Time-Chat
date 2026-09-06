-- ConnectNext Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_room_time ON messages (room_id, created_at);

-- Migrations for existing databases (safe to re-run before the seed below)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- v4 fix: room names must be unique (the API and seed both assume this, but the
-- original table had no constraint). De-duplicate first, then enforce it.
DELETE FROM rooms a USING rooms b WHERE a.name = b.name AND a.id > b.id;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rooms_name_unique') THEN
    ALTER TABLE rooms ADD CONSTRAINT rooms_name_unique UNIQUE (name);
  END IF;
END $$;

-- Insert sample rooms
INSERT INTO rooms (name, description) VALUES
  ('General', 'General discussion room'),
  ('Random', 'Random topics'),
  ('Help', 'Get help and support')
ON CONFLICT DO NOTHING;
