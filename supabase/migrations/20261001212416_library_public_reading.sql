begin;
alter table public.library_guide_contents add column public_readable boolean not null default false;
grant select on public.library_guide_contents to anon;
create policy library_public_guide_read on public.library_guide_contents for select to anon, authenticated using (public_readable);
-- Owner explicitly requested signed-out access for the existing 80 guides only.
update public.library_guide_contents set public_readable = true where product_id ~ '^audio-(00[1-9]|0[1-7][0-9]|080)$';
comment on column public.library_guide_contents.public_readable is 'Admin-controlled public reading. True permits anonymous full-body SELECT; false retains entitlement RLS. New guides default false.';
comment on table public.library_guide_contents is 'Lossless guide bodies outside Git/static builds. Public rows are intentionally readable without login; other rows require active entitlement.';
notify pgrst, 'reload schema';
commit;
