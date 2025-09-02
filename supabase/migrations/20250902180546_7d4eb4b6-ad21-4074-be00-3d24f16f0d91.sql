-- Harden normalize function with stable search_path
CREATE OR REPLACE FUNCTION public.normalize_creator_socials_platform()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.platform = LOWER(NEW.platform);
  RETURN NEW;
END;
$$;