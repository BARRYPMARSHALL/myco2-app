-- MYCO2.app Storage Setup
-- Run this LAST to set up photo storage

-- Create storage bucket for activity photos
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-photos', 'activity-photos', true);

-- Storage policies for activity photos
CREATE POLICY "Activity photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'activity-photos');
CREATE POLICY "Users can upload activity photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'activity-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE USING (bucket_id = 'activity-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (bucket_id = 'activity-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

