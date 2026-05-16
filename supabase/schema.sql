-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Action', 'action', '⚔️', 1),
  ('Puzzle', 'puzzle', '🧩', 2),
  ('Racing', 'racing', '🏎️', 3),
  ('Sports', 'sports', '⚽', 4),
  ('Adventure', 'adventure', '🗺️', 5),
  ('Shooting', 'shooting', '🎯', 6),
  ('Strategy', 'strategy', '♟️', 7),
  ('Multiplayer', 'multiplayer', '👥', 8),
  ('Arcade', 'arcade', '🕹️', 9),
  ('Simulation', 'simulation', '🏗️', 10);

-- ============================================
-- GAMES
-- ============================================
CREATE TYPE game_type AS ENUM ('iframe', 'hosted');
CREATE TYPE game_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  instructions TEXT,
  thumbnail_url TEXT,
  cover_url TEXT,
  game_type game_type NOT NULL,
  iframe_url TEXT,
  game_file_path TEXT,
  game_entry_file TEXT DEFAULT 'index.html',
  status game_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  width INT DEFAULT 960,
  height INT DEFAULT 640,
  orientation TEXT DEFAULT 'landscape',
  developer TEXT,
  developer_url TEXT,
  tags TEXT[] DEFAULT '{}',
  play_count INT DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAME <-> CATEGORY (many-to-many)
-- ============================================
CREATE TABLE game_categories (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, category_id)
);

-- ============================================
-- RATINGS
-- ============================================
CREATE TYPE game_reaction_type AS ENUM ('like', 'dislike');

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

CREATE TABLE game_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  visitor_id TEXT,
  voter_key TEXT NOT NULL,
  reaction game_reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, voter_key),
  CHECK (user_id IS NOT NULL OR visitor_id IS NOT NULL)
);

-- ============================================
-- COMMENTS
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  is_flagged BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- ============================================
-- PLAY HISTORY
-- ============================================
CREATE TABLE play_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_featured ON games(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_games_play_count ON games(play_count DESC);
CREATE INDEX idx_games_rating ON games(rating_avg DESC);
CREATE INDEX idx_games_published ON games(published_at DESC);
CREATE INDEX idx_games_tags ON games USING GIN(tags);
CREATE INDEX idx_comments_game ON comments(game_id, created_at DESC);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_play_history_user ON play_history(user_id, played_at DESC);
CREATE INDEX idx_ratings_game ON ratings(game_id);
CREATE INDEX idx_game_reactions_game_reaction ON game_reactions(game_id, reaction);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Published games are viewable by everyone" ON games FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage all games" ON games FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Game categories are viewable by everyone" ON game_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage game categories" ON game_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Ratings are viewable by everyone" ON ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can rate" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rating" ON ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Game reactions are viewable by everyone" ON game_reactions FOR SELECT USING (true);
CREATE POLICY "Admins can manage all game reactions" ON game_reactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Non-hidden comments are viewable" ON comments FOR SELECT USING (is_hidden = false);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all comments" ON comments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own history" ON play_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can log plays" ON play_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_game_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE games SET
    rating_avg = (SELECT COALESCE(AVG(score), 0) FROM ratings WHERE game_id = COALESCE(NEW.game_id, OLD.game_id)),
    rating_count = (SELECT COUNT(*) FROM ratings WHERE game_id = COALESCE(NEW.game_id, OLD.game_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.game_id, OLD.game_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_game_rating();

CREATE OR REPLACE FUNCTION increment_play_count(game_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE games SET play_count = play_count + 1, updated_at = NOW()
  WHERE id = game_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket (run separately in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('games', 'games', true);
