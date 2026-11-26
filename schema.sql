-- DEADLAB Commercial Database Schema (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS licenses (
  code TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'pro',     -- 'single' | 'pro' | 'team'
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  order_id TEXT UNIQUE,
  buyer_email TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  license_code TEXT NOT NULL,
  title TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_license ON projects(license_code);

CREATE TABLE IF NOT EXISTS team_rooms (
  room_id TEXT PRIMARY KEY,
  admin_token TEXT NOT NULL,
  project_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',  -- 'open' | 'locked'
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS team_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  voter_alias TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  levels_json TEXT NOT NULL,
  veto_json TEXT DEFAULT '{}',
  note TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_votes_room ON team_votes(room_id);
