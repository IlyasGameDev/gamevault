export type UserRole = 'user' | 'admin';
export type GameType = 'iframe' | 'hosted';
export type GameStatus = 'draft' | 'published' | 'archived';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  created_at: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  thumbnail_url: string | null;
  cover_url: string | null;
  game_type: GameType;
  iframe_url: string | null;
  game_file_path: string | null;
  game_entry_file: string;
  status: GameStatus;
  is_featured: boolean;
  width: number;
  height: number;
  orientation: string;
  developer: string | null;
  developer_url: string | null;
  tags: string[];
  play_count: number;
  rating_avg: number;
  rating_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameCategory {
  game_id: string;
  category_id: string;
}

export interface Rating {
  id: string;
  game_id: string;
  user_id: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  game_id: string;
  user_id: string;
  content: string;
  is_flagged: boolean;
  is_hidden: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  game_id: string;
  user_id: string;
  created_at: string;
}

export interface PlayHistory {
  id: string;
  game_id: string;
  user_id: string;
  played_at: string;
}

export interface GameWithCategories extends Game {
  categories: Category[];
}

export interface CommentWithProfile extends Comment {
  profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>;
}

export interface GameFormData {
  title: string;
  slug: string;
  description: string;
  instructions: string;
  developer: string;
  developer_url: string;
  game_type: GameType;
  iframe_url: string;
  game_file_path?: string;
  game_entry_file?: string;
  thumbnail_url: string;
  cover_url: string;
  category_ids: string[];
  tags: string[];
  width: number;
  height: number;
  orientation: string;
  status: GameStatus;
  is_featured: boolean;
}

export interface AdminStats {
  total_games: number;
  published_games: number;
  draft_games: number;
  archived_games: number;
  total_users: number;
  total_plays: number;
  total_comments: number;
  flagged_comments: number;
}
