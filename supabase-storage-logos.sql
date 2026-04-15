-- Site logoları için storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('site-logos', 'site-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read site logos" ON storage.objects FOR SELECT USING (bucket_id = 'site-logos');
CREATE POLICY "Auth upload site logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-logos');
CREATE POLICY "Auth update site logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-logos');
CREATE POLICY "Auth delete site logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-logos');
CREATE POLICY "Anon read site logos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'site-logos');
