-- Extend the existing Library tables; Auth, grants and RLS policies are preserved.
begin;
alter table public.library_guide_contents
  drop constraint library_guide_contents_product_id_check;
alter table public.library_guide_contents
  add constraint library_guide_contents_product_id_check
  check (product_id ~ '^audio-(?!000)[0-9]{3}$');
comment on table public.library_guide_contents is 'Private Library originals, lossless gzip/base64. Active product HTML entitlement required by RLS.';
comment on table public.library_entitlements is 'Admin grants only; authenticated users read their own Library product rights.';
notify pgrst, 'reload schema';
commit;
