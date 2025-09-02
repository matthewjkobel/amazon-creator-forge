-- Remove duplicate social media entries
DELETE FROM creator_socials cs1 
WHERE cs1.ctid > (
    SELECT min(cs2.ctid) 
    FROM creator_socials cs2 
    WHERE cs1.creator_id = cs2.creator_id 
    AND cs1.platform = cs2.platform 
    AND cs1.handle = cs2.handle 
    AND cs1.url = cs2.url
);