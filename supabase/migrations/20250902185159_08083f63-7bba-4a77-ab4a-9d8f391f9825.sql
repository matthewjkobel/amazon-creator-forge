-- Add custom niches to niches table if "Other" doesn't exist
INSERT INTO niches (name) 
SELECT 'Other' 
WHERE NOT EXISTS (SELECT 1 FROM niches WHERE name = 'Other');