-- Check what platforms are allowed in the creator_socials table
SELECT 
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'creator_socials_platform_check';