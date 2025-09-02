-- Add featured content URL and description fields to creators
ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS featured_content_url_2 text,
  ADD COLUMN IF NOT EXISTS featured_content_url_3 text,
  ADD COLUMN IF NOT EXISTS featured_content_desc_1 text,
  ADD COLUMN IF NOT EXISTS featured_content_desc_2 text,
  ADD COLUMN IF NOT EXISTS featured_content_desc_3 text;

-- Optional: comments for clarity
COMMENT ON COLUMN public.creators.featured_content_url_2 IS 'Second featured content URL shown on profile';
COMMENT ON COLUMN public.creators.featured_content_url_3 IS 'Third featured content URL shown on profile';
COMMENT ON COLUMN public.creators.featured_content_desc_1 IS 'Short description for featured content 1 (<=50 chars)';
COMMENT ON COLUMN public.creators.featured_content_desc_2 IS 'Short description for featured content 2 (<=50 chars)';
COMMENT ON COLUMN public.creators.featured_content_desc_3 IS 'Short description for featured content 3 (<=50 chars)';