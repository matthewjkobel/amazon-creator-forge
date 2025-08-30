-- Create function to ensure a row exists in public.users for the authenticated user
-- This avoids needing client-side INSERT permissions while satisfying FKs from creators/brands
CREATE OR REPLACE FUNCTION public.ensure_user_row(
  p_id uuid,
  p_email text,
  p_full_name text,
  p_role text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_id IS NULL OR p_email IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;

  -- Only allow creating/updating your own row
  IF p_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (p_id, p_email, p_full_name, COALESCE(p_role, 'brand'))
  ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
      role = CASE 
               WHEN public.users.role = 'admin' THEN public.users.role -- don't overwrite admins
               ELSE COALESCE(EXCLUDED.role, public.users.role)
             END;
END;
$$;