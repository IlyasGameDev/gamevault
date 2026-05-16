DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_reaction_type') THEN
    CREATE TYPE game_reaction_type AS ENUM ('like', 'dislike');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS game_reactions (
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

CREATE INDEX IF NOT EXISTS idx_game_reactions_game_reaction
  ON game_reactions(game_id, reaction);

ALTER TABLE game_reactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'game_reactions'
      AND policyname = 'Game reactions are viewable by everyone'
  ) THEN
    CREATE POLICY "Game reactions are viewable by everyone"
      ON game_reactions FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'game_reactions'
      AND policyname = 'Admins can manage all game reactions'
  ) THEN
    CREATE POLICY "Admins can manage all game reactions"
      ON game_reactions FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;
