-- Harden access to public.users to prevent email harvesting and role escalation
-- 1) Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2) Helper: secure admin check that bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = _user_id AND u.role = 'admin'
  );
$$;

-- 3) Helper: allow admins to update any user; non-admins may update only their own row and cannot change role
CREATE OR REPLACE FUNCTION public.can_update_users_row(_requester uuid, _target uuid, _new_role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role text;
BEGIN
  IF public.is_admin(_requester) THEN
    RETURN true;
  END IF;

  -- Non-admin: can only update own row
  IF _requester <> _target THEN
    RETURN false;
  END IF;

  -- Prevent self role escalation: new role must match existing
  SELECT role INTO current_role FROM public.users WHERE id = _target;
  RETURN _new_role = current_role;
END;
$$;

-- 4) Replace existing policies with secure variants restricted to authenticated users only
DROP POLICY IF EXISTS users_self_read ON public.users;
DROP POLICY IF EXISTS users_self_update ON public.users;
DROP POLICY IF EXISTS users_self_or_admin_read ON public.users;
DROP POLICY IF EXISTS users_self_or_admin_update ON public.users;

CREATE POLICY users_self_or_admin_read
ON public.users
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY users_self_or_admin_update
ON public.users
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR public.is_admin(auth.uid())
)
WITH CHECK (
  public.can_update_users_row(auth.uid(), id, role)
);
