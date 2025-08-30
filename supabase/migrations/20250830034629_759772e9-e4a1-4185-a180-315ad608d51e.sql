-- Create storage bucket for creator headshots
INSERT INTO storage.buckets (id, name, public) VALUES ('creator-headshots', 'creator-headshots', true);

-- Create policies for creator headshots
CREATE POLICY "Creator headshots are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'creator-headshots');

CREATE POLICY "Users can upload their own headshot" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'creator-headshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own headshot" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'creator-headshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own headshot" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'creator-headshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add headshot_url column to creators table if it doesn't exist
ALTER TABLE creators ADD COLUMN IF NOT EXISTS headshot_url TEXT;