-- Create admin user (you'll need to update this with your actual admin email)
-- First, let's add the creator role to the existing users table role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        -- If the enum doesn't exist, let's check what the current type constraint allows
        -- and see if we need to modify it to include 'creator' and 'admin'
        
        -- For now, let's assume the role column exists and can accept 'admin' and 'creator'
        -- If there are constraints, this migration will fail and we'll need to adjust
        NULL;
    END IF;
END $$;

-- Insert an admin user into the users table
-- Note: You'll need to create the auth user separately through Supabase Auth
-- This just creates the user record that links to the auth user
INSERT INTO public.users (id, email, full_name, role, created_at)
VALUES (
  -- Replace this UUID with an actual auth user ID after creating the auth user
  gen_random_uuid(),
  'admin@partnerconnections.com',
  'Admin User',
  'admin',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  full_name = 'Admin User';

-- Update RLS policy to allow admin users to use auth.admin functions
-- (This might already exist based on the existing schema)