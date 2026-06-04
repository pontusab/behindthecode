-- ============================================================================
-- Storage buckets (replaces Vercel Blob)
--   thumbnails — custom video posters
--   branding   — logo / favicon / default OG image
-- Both are public-read. Uploads happen server-side via the service role.
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('thumbnails', 'thumbnails', true),
  ('branding', 'branding', true)
on conflict (id) do nothing;

-- Public read access to objects in these buckets (they are public buckets,
-- but an explicit policy keeps the Data API behavior predictable).
create policy "public read thumbnails"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

create policy "public read branding"
  on storage.objects for select
  using (bucket_id = 'branding');
