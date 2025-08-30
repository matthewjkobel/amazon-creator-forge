-- Add missing fields to brands table for the brand profile form
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS amazon_storefront_url TEXT,
ADD COLUMN IF NOT EXISTS about TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add constraint to limit about field to 1000 characters
ALTER TABLE public.brands 
ADD CONSTRAINT brands_about_length_check 
CHECK (char_length(about) <= 1000);