-- Create test users for testing the profile detection flow
-- Test creator user
INSERT INTO public.users (id, email, full_name, role) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test.creator@example.com', 'Test Creator', 'creator')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Test brand user  
INSERT INTO public.users (id, email, full_name, role) VALUES 
  ('22222222-2222-2222-2222-222222222222', 'test.brand@example.com', 'Test Brand User', 'brand')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Create test creator profile
INSERT INTO public.creators (user_id, display_name, bio, visibility, approval_status) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Amazing Test Creator', 'I create amazing content for testing purposes', 'public', 'approved')
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio;

-- Create test brand profile
INSERT INTO public.brands (user_id, company_name, contact_name, contact_email, about, approval_status) VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Test Brand Co', 'Brand Manager', 'test.brand@example.com', 'We are a test brand for development purposes', 'approved')
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email;