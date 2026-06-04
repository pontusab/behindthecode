-- ============================================================================
-- Aggregate helpers for the admin dashboard.
-- ============================================================================

create or replace function public.dashboard_stats()
returns table (
  total_videos    bigint,
  total_views     bigint,
  total_likes     bigint,
  total_comments  bigint,
  flagged_comments bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.videos),
    (select coalesce(sum(view_count), 0) from public.videos),
    (select coalesce(sum(like_count), 0) from public.videos),
    (select count(*) from public.comments where status = 'published'),
    (select count(*) from public.comments where status = 'flagged');
$$;

revoke execute on function public.dashboard_stats() from anon, authenticated;

-- Daily view counts for the last p_days days, zero-filled, oldest first.
create or replace function public.views_timeseries(p_days integer)
returns table (day date, views bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    d::date as day,
    coalesce(dv.count, 0) as views
  from generate_series(
    (current_date - (p_days - 1)),
    current_date,
    interval '1 day'
  ) as d
  left join public.daily_views dv on dv.day = d::date
  order by d asc;
$$;

revoke execute on function public.views_timeseries(integer) from anon, authenticated;
