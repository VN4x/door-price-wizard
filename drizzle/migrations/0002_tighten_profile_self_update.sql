-- Self-service updates are handled by server functions with a narrow column
-- set; a signed-in user must not be able to change their own status.
drop policy if exists "own name update" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;