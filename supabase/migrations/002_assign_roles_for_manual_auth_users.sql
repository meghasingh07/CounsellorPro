-- Run AFTER `001_users_and_profile_trigger.sql`.
--
-- Auth UI does not store roles. Roles live in `public.users.role`.
-- The first migration backfills every auth user as `student` by default.
-- This script sets the correct role for accounts you created manually.

update public.users
set role = 'admin'::public.user_role
where email = 'admin@counsellorpro.test';

update public.users
set role = 'counselor'::public.user_role
where email = 'counselor@counsellorpro.test';

update public.users
set role = 'student'::public.user_role
where email = 'student@counsellorpro.test';

-- Verify (optional): Table Editor → public.users should show three rows with roles.
