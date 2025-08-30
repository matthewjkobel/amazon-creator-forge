-- Add approval system fields to creators and brands tables
ALTER TABLE public.creators 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance on approval queries
CREATE INDEX IF NOT EXISTS idx_creators_approval_status ON public.creators(approval_status);
CREATE INDEX IF NOT EXISTS idx_brands_approval_status ON public.brands(approval_status);

-- Update RLS policies to only show approved profiles in public views
-- For creators table - update the public read policy
DROP POLICY IF EXISTS "creators_public_read" ON public.creators;
CREATE POLICY "creators_public_read" 
ON public.creators 
FOR SELECT 
USING (visibility = 'public' AND approval_status = 'approved');

-- For brands table - we need to add a public read policy since brands don't have one yet
CREATE POLICY "brands_public_read" 
ON public.brands 
FOR SELECT 
USING (approval_status = 'approved');