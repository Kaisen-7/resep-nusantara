-- ============================================================
-- Nusa Culinary — Supabase PostgreSQL Migration
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================
-- 1. PROFILES (User Profiles)
-- ============================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================
-- 2. RECIPES
-- ============================
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  prep_time TEXT DEFAULT '',
  cook_time TEXT DEFAULT '',
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Easy',
  calories TEXT DEFAULT '',
  category TEXT CHECK (category IN ('Appetizer', 'Main Course', 'Dessert', 'Drink')) DEFAULT 'Main Course',
  region TEXT DEFAULT '',
  spicy BOOLEAN DEFAULT FALSE,
  servings TEXT DEFAULT '',
  youtube_url TEXT,
  video_url TEXT,
  nutrition JSONB,
  variations JSONB,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating FLOAT DEFAULT 0,
  rating_count INT DEFAULT 0,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Nusa Culinary',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipes are publicly viewable" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = author_id);

-- ============================
-- 3. COMMENTS
-- ============================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  text TEXT NOT NULL CHECK (char_length(text) <= 500),
  helpful_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are publicly viewable" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can update comment metrics" ON comments
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- ============================
-- 4. SAVED RECIPES (Bookmarks)
-- ============================
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved recipes" ON saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes" ON saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes" ON saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================
-- 5. SHOPPING LIST
-- ============================
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  detail TEXT DEFAULT '',
  checked BOOLEAN DEFAULT FALSE,
  recipe_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shopping items" ON shopping_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create shopping items" ON shopping_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping items" ON shopping_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping items" ON shopping_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================
-- 6. STORAGE BUCKET
-- ============================
-- Buat bucket "recipe-images" melalui Supabase Dashboard:
-- Storage → New Bucket → Name: "recipe-images" → Public: ON
--
-- Storage policies (buat via Dashboard → Storage → Policies):
-- 1. Allow authenticated uploads: INSERT for authenticated users
-- 2. Allow public reads: SELECT for everyone
