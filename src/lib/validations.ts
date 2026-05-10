import { z } from 'zod';

export const gameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens'),
  description: z.string().max(2000).optional(),
  instructions: z.string().max(2000).optional(),
  developer: z.string().max(100).optional(),
  developer_url: z.string().url().optional().or(z.literal('')),
  game_type: z.enum(['iframe', 'hosted']),
  iframe_url: z.string().url().optional().or(z.literal('')),
  thumbnail_url: z.string().optional(),
  cover_url: z.string().optional(),
  category_ids: z.array(z.string().uuid()).min(1, 'Select at least one category'),
  tags: z.array(z.string()).default([]),
  width: z.number().int().min(100).max(3840).default(960),
  height: z.number().int().min(100).max(2160).default(640),
  orientation: z.enum(['landscape', 'portrait']).default('landscape'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  is_featured: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  display_order: z.number().int().min(0).default(0),
});

export const commentSchema = z.object({
  game_id: z.string().uuid(),
  content: z.string().min(1).max(1000),
  parent_id: z.string().uuid().optional(),
});

export const ratingSchema = z.object({
  game_id: z.string().uuid(),
  score: z.number().int().min(1).max(5),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
