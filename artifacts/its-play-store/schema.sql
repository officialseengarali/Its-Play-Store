-- ============================================================
-- Its Play Store — Supabase Schema v2
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/panbeonjnrqennwnmajk/sql/new
-- ============================================================

-- 1. Categories
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  icon        text,
  created_at  timestamptz not null default now()
);

-- 2. Apps
create table if not exists public.apps (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  developer   text not null,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  icon_url    text,
  apk_url     text,
  version     text,
  size        text,
  rating      numeric(3,1) not null default 0 check (rating >= 0 and rating <= 5),
  downloads   integer not null default 0,
  is_featured boolean not null default false,
  status      text not null default 'live' check (status in ('live', 'draft', 'suspended')),
  created_at  timestamptz not null default now()
);

-- Add status column if upgrading from v1
alter table public.apps add column if not exists status text not null default 'live' check (status in ('live', 'draft', 'suspended'));

-- 3. App Versions (version history + changelogs)
create table if not exists public.app_versions (
  id          uuid primary key default gen_random_uuid(),
  app_id      uuid not null references public.apps(id) on delete cascade,
  version     text not null,
  apk_url     text,
  size        text,
  changelog   text,
  created_at  timestamptz not null default now()
);

-- 4. Screenshots
create table if not exists public.screenshots (
  id          uuid primary key default gen_random_uuid(),
  app_id      uuid not null references public.apps(id) on delete cascade,
  image_url   text not null,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 5. Users (mirrors Supabase auth.users)
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- 6. Reviews
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  app_id      uuid not null references public.apps(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  rating      smallint not null check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique(app_id, user_id)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.categories enable row level security;
alter table public.apps enable row level security;
alter table public.app_versions enable row level security;
alter table public.screenshots enable row level security;
alter table public.users enable row level security;
alter table public.reviews enable row level security;

-- Public read for everyone
create policy if not exists "Public read categories" on public.categories for select using (true);
create policy if not exists "Public read apps" on public.apps for select using (true);
create policy if not exists "Public read app_versions" on public.app_versions for select using (true);
create policy if not exists "Public read screenshots" on public.screenshots for select using (true);
create policy if not exists "Public read users" on public.users for select using (true);
create policy if not exists "Public read reviews" on public.reviews for select using (true);

-- Authenticated users can manage app_versions (admin only enforced client-side)
create policy if not exists "Auth manage app_versions" on public.app_versions for all to authenticated using (true) with check (true);

-- Authenticated users can manage apps (admin only enforced client-side)
create policy if not exists "Auth manage apps" on public.apps for all to authenticated using (true) with check (true);
create policy if not exists "Auth manage categories" on public.categories for all to authenticated using (true) with check (true);
create policy if not exists "Auth manage screenshots" on public.screenshots for all to authenticated using (true) with check (true);

-- Authenticated users can insert their own review
create policy if not exists "Auth insert review" on public.reviews for insert to authenticated
  with check (auth.uid() = user_id);
create policy if not exists "Auth update review" on public.reviews for update to authenticated
  using (auth.uid() = user_id);
create policy if not exists "Auth delete review" on public.reviews for delete to authenticated
  using (auth.uid() = user_id);

-- Users can manage their own profile
create policy if not exists "Auth insert user profile" on public.users for insert to authenticated
  with check (auth.uid() = id);
create policy if not exists "Auth update user profile" on public.users for update to authenticated
  using (auth.uid() = id);

-- ============================================================
-- Helper: increment download count atomically
-- ============================================================
create or replace function public.increment_downloads(app_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.apps set downloads = downloads + 1 where id = app_id;
end;
$$;

-- ============================================================
-- Trigger: auto-create user profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Storage: APK bucket
-- ============================================================
insert into storage.buckets (id, name, public) values ('apks', 'apks', true)
  on conflict (id) do nothing;

create policy if not exists "Public read apks" on storage.objects for select using (bucket_id = 'apks');
create policy if not exists "Auth upload apks" on storage.objects for insert
  with check (bucket_id = 'apks' and auth.role() = 'authenticated');

-- ============================================================
-- Indexes for performance
-- ============================================================
create index if not exists idx_apps_category    on public.apps(category_id);
create index if not exists idx_apps_featured    on public.apps(is_featured) where is_featured = true;
create index if not exists idx_apps_downloads   on public.apps(downloads desc);
create index if not exists idx_apps_rating      on public.apps(rating desc);
create index if not exists idx_apps_status      on public.apps(status);
create index if not exists idx_screenshots_app  on public.screenshots(app_id);
create index if not exists idx_reviews_app      on public.reviews(app_id);
create index if not exists idx_reviews_user     on public.reviews(user_id);
create index if not exists idx_app_versions_app on public.app_versions(app_id);
create index if not exists idx_app_versions_ts  on public.app_versions(created_at desc);
