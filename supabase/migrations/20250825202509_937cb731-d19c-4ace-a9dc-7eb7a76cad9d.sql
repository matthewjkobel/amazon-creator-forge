-- Set member_user_ids view to use security_invoker so RLS is evaluated as the querying user
ALTER VIEW public.member_user_ids SET (security_invoker = true);
