-- Uitvoeren in Supabase SQL editor voordat je de cloudmodus gebruikt.
create table if not exists public.observations (
  user_id uuid not null references auth.users(id) on delete cascade,
  species_id text not null,
  seen_date date,
  location text,
  photo_path text,
  created_at timestamptz default now(),
  primary key(user_id,species_id)
);
alter table public.observations enable row level security;
revoke all on public.observations from anon;
grant select, insert, update, delete on public.observations to authenticated;
create policy "read own observations" on public.observations for select to authenticated using ((select auth.uid())=user_id);
create policy "insert own observations" on public.observations for insert to authenticated with check ((select auth.uid())=user_id);
create policy "update own observations" on public.observations for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "delete own observations" on public.observations for delete to authenticated using ((select auth.uid())=user_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('bird-photos','bird-photos',false,8388608,array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do update set public=false,file_size_limit=8388608,allowed_mime_types=excluded.allowed_mime_types;
create policy "select own bird photos" on storage.objects for select to authenticated
using (bucket_id='bird-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "upload own bird photos" on storage.objects for insert to authenticated
with check (bucket_id='bird-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "delete own bird photos" on storage.objects for delete to authenticated
using (bucket_id='bird-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
