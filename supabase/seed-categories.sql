-- GameMonetize categories seed
-- Run this in the Supabase SQL Editor.
-- Safe to re-run: ON CONFLICT DO NOTHING skips existing rows.

INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Action',      'action',      '⚔️',  1),
  ('Adventure',   'adventure',   '🗺️',  2),
  ('Arcade',      'arcade',      '🕹️',  3),
  ('Boys',        'boys',        '🧒',  4),
  ('Clicker',     'clicker',     '👆',  5),
  ('Cooking',     'cooking',     '🍳',  6),
  ('Girls',       'girls',       '👧',  7),
  ('Hypercasual', 'hypercasual', '🎯',  8),
  ('Multiplayer', 'multiplayer', '👥',  9),
  ('Puzzle',      'puzzle',      '🧩',  10),
  ('Racing',      'racing',      '🏎️', 11),
  ('Shooting',    'shooting',    '🎯',  12),
  ('Soccer',      'soccer',      '⚽',  13),
  ('Sports',      'sports',      '🏆',  14),
  ('Stickman',    'stickman',    '🏃',  15),
  ('3D',          '3d',          '🎮',  16),
  ('.IO',         'io',          '🌐',  17),
  ('2 Player',    '2-player',    '👫',  18),
  ('Bejeweled',   'bejeweled',   '💎',  19)
ON CONFLICT (slug) DO NOTHING;
