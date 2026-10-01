-- Only new Library-owned tables. Existing Auth and other applications are untouched.
begin;

create table public.library_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null check (product_id ~ '^audio-[0-9]{3}$'),
  access_type text not null default 'html' check (access_type in ('html', 'pdf', 'all')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, product_id, access_type),
  check (expires_at is null or expires_at > granted_at)
);

alter table public.library_entitlements enable row level security;
revoke all on public.library_entitlements from public, anon, authenticated;
grant select on public.library_entitlements to authenticated;
create policy library_own_entitlements on public.library_entitlements
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- A compressed, private body for the one-guide pilot. No HTML enters build output.
-- Database storage avoids a new admin/service key; Storage can replace this backend later.
create table public.library_guide_contents (
  product_id text primary key check (product_id = 'audio-050'),
  html_gzip_base64 text not null,
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  byte_length integer not null check (byte_length between 1 and 2000000),
  updated_at timestamptz not null default now()
);

alter table public.library_guide_contents enable row level security;
revoke all on public.library_guide_contents from public, anon, authenticated;
grant select on public.library_guide_contents to authenticated;
create policy library_entitled_guide_read on public.library_guide_contents
  for select to authenticated
  using (exists (
    select 1 from public.library_entitlements e
    where e.user_id = (select auth.uid())
      and e.product_id = library_guide_contents.product_id
      and e.access_type in ('html', 'all')
      and e.granted_at <= now()
      and (e.expires_at is null or e.expires_at > now())
  ));

comment on table public.library_entitlements is 'Admin grants only; users can read their own rows. Library U47 pilot.';
comment on table public.library_guide_contents is 'Private U47 original, compressed losslessly. Select requires an active HTML entitlement.';
notify pgrst, 'reload schema';
commit;
