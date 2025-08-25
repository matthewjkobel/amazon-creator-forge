-- Security fix: Add RLS protection to member_user_ids table
-- This table controls premium access and should be admin-only

-- Enable RLS on member_user_ids table
ALTER TABLE public.member_user_ids ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write membership data
CREATE POLICY "member_user_ids_admin_only"
ON public.member_user_ids
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));