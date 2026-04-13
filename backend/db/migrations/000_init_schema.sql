-- Base schema for UniPath

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  clerk_user_id TEXT UNIQUE,
  gpa NUMERIC(3,2),
  preferred_city TEXT,
  preferred_program TEXT,
  preferred_language TEXT,
  preferred_country TEXT,
  max_tuition NUMERIC,
  reminders_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  city TEXT,
  program TEXT,
  min_gpa NUMERIC,
  language TEXT,
  tuition NUMERIC,
  tuition_fee NUMERIC,
  deadline DATE,
  image_url TEXT,
  website_url TEXT,
  description TEXT,
  world_ranking INTEGER,
  acceptance_rate NUMERIC,
  required_documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Not Started',
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_university UNIQUE (user_id, university_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
