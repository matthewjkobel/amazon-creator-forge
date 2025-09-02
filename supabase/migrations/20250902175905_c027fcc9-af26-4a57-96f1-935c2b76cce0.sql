-- Update creator_socials platform constraint to allow 'x' instead of 'twitter'
-- First drop the existing constraint
ALTER TABLE public.creator_socials 
DROP CONSTRAINT IF EXISTS creator_socials_platform_check;

-- Add new constraint that includes 'x' but not 'twitter'
ALTER TABLE public.creator_socials 
ADD CONSTRAINT creator_socials_platform_check 
CHECK (platform IN ('amazon', 'youtube', 'tiktok', 'instagram', 'facebook', 'pinterest', 'blog', 'x'));

-- Update any existing 'twitter' records to 'x' (if any exist)
UPDATE public.creator_socials 
SET platform = 'x' 
WHERE LOWER(platform) = 'twitter';

-- Add trigger to normalize platform values to lowercase on insert/update
CREATE OR REPLACE FUNCTION normalize_creator_socials_platform()
RETURNS TRIGGER AS $$
BEGIN
  NEW.platform = LOWER(NEW.platform);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER creator_socials_normalize_platform
  BEFORE INSERT OR UPDATE ON public.creator_socials
  FOR EACH ROW
  EXECUTE FUNCTION normalize_creator_socials_platform();