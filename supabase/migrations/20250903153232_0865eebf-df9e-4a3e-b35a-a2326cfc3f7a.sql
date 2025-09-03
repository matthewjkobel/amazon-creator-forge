-- Update ensure_user_row to reconcile by email and migrate ownership to current auth.uid
CREATE OR REPLACE FUNCTION public.ensure_user_row(
  p_id uuid,
  p_email text,
  p_full_name text,
  p_role text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_id uuid;
  v_old_role text;
  v_effective_role text;
BEGIN
  IF p_id IS NULL OR p_email IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;

  -- Only allow creating/updating your own row
  IF p_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Find an existing users row with the same email but a different id
  SELECT id, role INTO v_old_id, v_old_role
  FROM public.users
  WHERE email = p_email AND id <> p_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_old_id IS NOT NULL THEN
    -- Migrate ownership in related tables to the current auth user
    UPDATE public.brands SET user_id = p_id WHERE user_id = v_old_id;
    UPDATE public.creators SET user_id = p_id WHERE user_id = v_old_id;
    UPDATE public.member_user_ids SET user_id = p_id WHERE user_id = v_old_id;

    -- Preserve admin role if the old row had it
    IF v_old_role = 'admin' THEN
      v_effective_role := 'admin';
    END IF;

    -- Remove the old duplicate users row to avoid duplicates going forward
    DELETE FROM public.users WHERE id = v_old_id;
  END IF;

  -- If the current row already exists and is admin, keep admin no matter what
  IF v_effective_role IS NULL THEN
    SELECT CASE WHEN role = 'admin' THEN 'admin' ELSE NULL END INTO v_effective_role
    FROM public.users WHERE id = p_id;
  END IF;

  -- Upsert the current user's row
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (p_id, p_email, p_full_name, COALESCE(v_effective_role, COALESCE(p_role, 'brand')))
  ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
      role = CASE 
               WHEN public.users.role = 'admin' THEN public.users.role -- don't downgrade existing admins
               WHEN COALESCE(v_effective_role, EXCLUDED.role) = 'admin' THEN 'admin' -- preserve admin from old row
               ELSE COALESCE(EXCLUDED.role, public.users.role)
             END;
END;
$function$;