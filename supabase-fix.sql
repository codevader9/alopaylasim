-- =============================================
-- RLS INFINITE RECURSION FIX
-- =============================================
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Eski policy'leri sil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- 2. Admin kontrolü için SECURITY DEFINER fonksiyon (RLS'i bypass eder)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. SELECT: Herkes kendi profilini görebilir VEYA admin ise hepsini görebilir
CREATE POLICY "profiles_select"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- 4. INSERT: Kullanıcı sadece kendi profilini oluşturabilir
CREATE POLICY "profiles_insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. UPDATE: Kendi profilini güncelleyebilir VEYA admin ise hepsini
CREATE POLICY "profiles_update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 6. DELETE: Sadece admin silebilir
CREATE POLICY "profiles_delete"
  ON public.profiles
  FOR DELETE
  USING (public.is_admin());
