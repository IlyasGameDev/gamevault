BEGIN;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE (
  total_games bigint,
  published_games bigint,
  draft_games bigint,
  archived_games bigint,
  total_game_loads bigint,
  signed_in_loads bigint,
  total_users bigint,
  total_comments bigint,
  flagged_comments bigint
)
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT g.total, g.published, g.draft, g.archived, g.loads,
    (SELECT count(h.user_id) FROM public.play_history h),
    (SELECT count(*) FROM public.profiles),
    c.total, c.flagged
  FROM (
    SELECT count(*) AS total,
      count(*) FILTER (WHERE status = 'published') AS published,
      count(*) FILTER (WHERE status = 'draft') AS draft,
      count(*) FILTER (WHERE status = 'archived') AS archived,
      coalesce(sum(play_count), 0) AS loads
    FROM public.games
  ) g
  CROSS JOIN (
    SELECT count(*) AS total, count(*) FILTER (WHERE is_flagged) AS flagged
    FROM public.comments
  ) c;
$$;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
