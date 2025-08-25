-- Harden users table RLS and function search_path

-- 1) Ensure RLS is enabled on users (idempotent)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2) Create restrictive policies only if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_self_or_admin_read'
  ) THEN
    CREATE POLICY "users_self_or_admin_read"
    ON public.users
    FOR SELECT
    USING ((id = auth.uid()) OR public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_self_or_admin_update'
  ) THEN
    CREATE POLICY "users_self_or_admin_update"
    ON public.users
    FOR UPDATE
    USING ((id = auth.uid()) OR public.is_admin(auth.uid()))
    WITH CHECK (public.can_update_users_row(auth.uid(), id, role));
  END IF;
END $$;

-- 3) Revoke anon direct table grants as a defense-in-depth measure
REVOKE SELECT ON TABLE public.users FROM anon;

-- 4) Security hardening: ensure deterministic search_path for the timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;