-- =============================================
-- PAYLAŞIM PANELİ - SUPABASE VERITABANI ŞEMASI
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Profiles tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RLS (Row Level Security) aktif et
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Admin kontrolü için SECURITY DEFINER fonksiyon (RLS'i bypass eder, sonsuz döngüyü önler)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. SELECT: Herkes kendi profilini görebilir VEYA admin ise hepsini görebilir
CREATE POLICY "profiles_select"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- 5. INSERT: Kullanıcı sadece kendi profilini oluşturabilir
CREATE POLICY "profiles_insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. UPDATE: Kendi profilini güncelleyebilir VEYA admin ise hepsini
CREATE POLICY "profiles_update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 7. DELETE: Sadece admin silebilir
CREATE POLICY "profiles_delete"
  ON public.profiles
  FOR DELETE
  USING (public.is_admin());

-- 8. updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Yeni auth kullanıcısı oluşturulunca otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- İLK ADMIN KULLANICISI OLUŞTURMA
-- =============================================

UPDATE public.profiles
SET role = 'admin'
WHERE id = 'ba4e4db9-0729-4887-b3c8-d368668198d8';
