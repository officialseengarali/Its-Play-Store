-- Its Play Store — Supabase Schema
-- Run this in your Supabase SQL Editor at: https://supabase.com/dashboard

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Apps
CREATE TABLE IF NOT EXISTS apps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  developer text NOT NULL,
  category_id uuid REFERENCES categories(id),
  description text,
  icon_url text,
  apk_url text,
  version text,
  size text,
  rating numeric DEFAULT 0,
  downloads integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Screenshots
CREATE TABLE IF NOT EXISTS screenshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE,
  image_url text,
  "order" integer,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- User profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read apps" ON apps FOR SELECT USING (true);
CREATE POLICY "Public read screenshots" ON screenshots FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);

-- Authenticated write policies
CREATE POLICY "Auth insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth manage own profile" ON users FOR ALL USING (auth.uid() = id);

-- Storage: Create apks bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('apks', 'apks', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read apks" ON storage.objects FOR SELECT USING (bucket_id = 'apks');
CREATE POLICY "Auth upload apks" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'apks' AND auth.role() = 'authenticated');
