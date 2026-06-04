-- ============================================================================
-- BehindTheCode schema (Supabase / Postgres)
-- Replaces the previous Upstash Redis data model.
-- All access happens server-side via the service role; RLS is enabled on every
-- table as defense-in-depth, with read policies for genuinely public content.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: is the current JWT an admin? (role mirrored into app_metadata)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ===========================================================================
-- profiles (mirrors auth.users, holds role + public author fields)
-- ===========================================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  name        text not null default '',
  image       text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  banned      boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by everyone"
  on public.profiles for select using (true);

create policy "users can update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- ===========================================================================
-- categories
-- ===========================================================================
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;
create policy "categories are public" on public.categories for select using (true);

-- ===========================================================================
-- tags
-- ===========================================================================
create table public.tags (
  slug        text primary key,
  name        text not null,
  created_at  timestamptz not null default now()
);

alter table public.tags enable row level security;
create policy "tags are public" on public.tags for select using (true);

-- ===========================================================================
-- videos
-- ===========================================================================
create table public.videos (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  description       text not null default '',
  processing_status text not null default 'uploading'
                      check (processing_status in ('uploading','processing','ready','errored')),
  publish_status    text not null default 'draft'
                      check (publish_status in ('draft','scheduled','published')),
  mux_upload_id     text,
  mux_asset_id      text,
  playback_id       text,
  playback_policy   text not null default 'public' check (playback_policy in ('public','signed')),
  duration          double precision,
  aspect_ratio      text,
  thumbnail_time    double precision,
  custom_poster_url text,
  category_id       uuid references public.categories (id) on delete set null,
  tags              text[] not null default '{}',
  access            text not null default 'free' check (access in ('free','subscribers','purchase')),
  required_plan_ids text[] not null default '{}',
  polar_product_id  text,
  price_amount      integer,
  visibility        text not null default 'public' check (visibility in ('public','unlisted')),
  view_count        bigint not null default 0,
  like_count        bigint not null default 0,
  comment_count     bigint not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  publish_at        timestamptz,
  published_at      timestamptz,
  search            tsvector generated always as (
                      to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''))
                    ) stored
);

create index videos_published_at_idx on public.videos (published_at desc nulls last);
create index videos_view_count_idx   on public.videos (view_count desc);
create index videos_like_count_idx   on public.videos (like_count desc);
create index videos_created_at_idx   on public.videos (created_at desc);
create index videos_category_idx     on public.videos (category_id);
create index videos_publish_status_idx on public.videos (publish_status);
create index videos_tags_idx         on public.videos using gin (tags);
create index videos_search_idx       on public.videos using gin (search);

alter table public.videos enable row level security;

-- Public can read published, public-visibility videos. Unlisted are reachable
-- by direct slug through the server (service role) but not listed via Data API.
create policy "published videos are public"
  on public.videos for select
  using (publish_status = 'published' and visibility = 'public');

-- ===========================================================================
-- comments
-- ===========================================================================
create table public.comments (
  id           uuid primary key default gen_random_uuid(),
  video_id     uuid not null references public.videos (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  author_name  text not null default '',
  author_image text,
  body         text not null,
  status       text not null default 'published' check (status in ('published','flagged','removed')),
  ai_reason    text,
  created_at   timestamptz not null default now()
);

create index comments_video_idx on public.comments (video_id, created_at desc);
create index comments_status_idx on public.comments (status, created_at desc);

alter table public.comments enable row level security;

create policy "published comments are public"
  on public.comments for select using (status = 'published');

create policy "users can insert own comments"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "users can delete own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- ===========================================================================
-- likes (per-user dedupe)
-- ===========================================================================
create table public.likes (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  video_id   uuid not null references public.videos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

alter table public.likes enable row level security;

create policy "users manage own likes"
  on public.likes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- plans (subscriptions)
-- ===========================================================================
create table public.plans (
  id              uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text not null default '',
  polar_product_id text not null,
  interval         text not null default 'month' check (interval in ('month','year')),
  amount          integer not null default 0,
  currency        text not null default 'usd',
  created_at      timestamptz not null default now()
);

alter table public.plans enable row level security;
create policy "plans are public" on public.plans for select using (true);

-- ===========================================================================
-- purchases (one-time video purchases)
-- ===========================================================================
create table public.purchases (
  user_id          uuid not null references public.profiles (id) on delete cascade,
  video_id         uuid not null references public.videos (id) on delete cascade,
  polar_order_id   text,
  amount           integer not null default 0,
  currency         text not null default 'usd',
  created_at       timestamptz not null default now(),
  primary key (user_id, video_id)
);

alter table public.purchases enable row level security;
create policy "users read own purchases"
  on public.purchases for select using (auth.uid() = user_id);

-- ===========================================================================
-- billing (per-user subscription state)
-- ===========================================================================
create table public.billing (
  user_id            uuid primary key references public.profiles (id) on delete cascade,
  polar_customer_id  text unique,
  status             text,
  plan_id            uuid references public.plans (id) on delete set null,
  current_period_end bigint,
  updated_at         timestamptz not null default now()
);

alter table public.billing enable row level security;
create policy "users read own billing"
  on public.billing for select using (auth.uid() = user_id);

-- ===========================================================================
-- settings (singleton row, stored as jsonb merged with app defaults)
-- ===========================================================================
create table public.settings (
  id         smallint primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.settings (id, data) values (1, '{}'::jsonb);

alter table public.settings enable row level security;
create policy "settings are public" on public.settings for select using (true);

-- ===========================================================================
-- daily_views (admin analytics chart)
-- ===========================================================================
create table public.daily_views (
  day   date primary key,
  count bigint not null default 0
);

alter table public.daily_views enable row level security;
-- no public policy: admin reads via service role only

-- ===========================================================================
-- processed_webhooks (idempotency for Mux + Polar)
-- ===========================================================================
create table public.processed_webhooks (
  id         text primary key,
  provider   text not null,
  created_at timestamptz not null default now()
);

alter table public.processed_webhooks enable row level security;
-- no public policy: written via service role only

-- ===========================================================================
-- rate_counters (fixed-window limiter) + atomic RPC
-- ===========================================================================
create table public.rate_counters (
  key          text primary key,
  count        integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_counters enable row level security;
-- no public policy: accessed via security-definer RPC / service role only

create or replace function public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_start timestamptz;
begin
  insert into public.rate_counters (key, count, window_start)
    values (p_key, 1, now())
  on conflict (key) do update
    set count = case
          when public.rate_counters.window_start < now() - make_interval(secs => p_window_seconds)
            then 1
          else public.rate_counters.count + 1
        end,
        window_start = case
          when public.rate_counters.window_start < now() - make_interval(secs => p_window_seconds)
            then now()
          else public.rate_counters.window_start
        end
  returning count, window_start into v_count, v_start;

  return v_count <= p_max;
end;
$$;

revoke execute on function public.check_rate_limit(text, integer, integer) from anon, authenticated;

-- ===========================================================================
-- view increment RPC (counter + daily rollup, atomic)
-- ===========================================================================
create or replace function public.increment_view(p_video_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_views bigint;
begin
  update public.videos set view_count = view_count + 1
    where id = p_video_id
    returning view_count into v_views;

  insert into public.daily_views (day, count) values (current_date, 1)
    on conflict (day) do update set count = public.daily_views.count + 1;

  return v_views;
end;
$$;

revoke execute on function public.increment_view(uuid) from anon, authenticated;

-- ===========================================================================
-- Count-maintenance triggers
-- ===========================================================================
create or replace function public.likes_count_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.videos set like_count = like_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.videos set like_count = greatest(like_count - 1, 0) where id = old.video_id;
  end if;
  return null;
end;
$$;

create trigger likes_count_aiud
  after insert or delete on public.likes
  for each row execute function public.likes_count_trigger();

create or replace function public.comments_count_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'published' then
      update public.videos set comment_count = comment_count + 1 where id = new.video_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.status = 'published' then
      update public.videos set comment_count = greatest(comment_count - 1, 0) where id = old.video_id;
    end if;
  elsif tg_op = 'UPDATE' then
    if old.status = 'published' and new.status <> 'published' then
      update public.videos set comment_count = greatest(comment_count - 1, 0) where id = new.video_id;
    elsif old.status <> 'published' and new.status = 'published' then
      update public.videos set comment_count = comment_count + 1 where id = new.video_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger comments_count_aiud
  after insert or delete or update on public.comments
  for each row execute function public.comments_count_trigger();

-- ===========================================================================
-- updated_at maintenance for videos
-- ===========================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger videos_set_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- New auth user -> profile, first user becomes admin, mirror role to app_metadata
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_count integer;
  v_role  text;
begin
  select count(*) into v_count from public.profiles;
  if v_count = 0 then
    v_role := 'admin';
  else
    v_role := 'user';
  end if;

  insert into public.profiles (id, email, name, image, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    v_role
  );

  -- Mirror authorization role into app_metadata (safe for JWT-based checks)
  update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', v_role)
    where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
