-- Mevcut auth kullanıcısı için profil oluştur ve admin yap
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin'),
  'admin'
FROM auth.users
WHERE id = 'ba4e4db9-0729-4887-b3c8-d368668198d8'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
