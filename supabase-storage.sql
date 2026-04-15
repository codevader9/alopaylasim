-- Match görselleri için storage bucket oluştur
INSERT INTO storage.buckets (id, name, public) VALUES ('match-images', 'match-images', true);

-- Herkese okuma izni
CREATE POLICY "Public read match images" ON storage.objects FOR SELECT USING (bucket_id = 'match-images');

-- Authenticated kullanıcılar yükleyebilir
CREATE POLICY "Auth upload match images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'match-images');

-- Anon da yükleyebilir (backend scheduler için)
CREATE POLICY "Anon upload match images" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'match-images');

-- Silme izni
CREATE POLICY "Auth delete match images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'match-images');
CREATE POLICY "Anon delete match images" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'match-images');
