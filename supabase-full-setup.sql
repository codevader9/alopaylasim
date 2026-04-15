-- =============================================
-- PAYLAŞIM PANELİ - TAM KURULUM SQL
-- =============================================
-- Bu SQL'i yeni Supabase projesinin SQL Editor'ına
-- yapıştırıp tek seferde çalıştırın.
-- =============================================

-- =============================================
-- BÖLÜM 1: FONKSİYONLAR
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- BÖLÜM 2: TABLOLAR
-- =============================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sites
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proxies
CREATE TABLE IF NOT EXISTS public.proxies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT,
  password TEXT,
  protocol TEXT NOT NULL DEFAULT 'http' CHECK (protocol IN ('http', 'https', 'socks5')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social Accounts
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'telegram', 'instagram')),
  account_name TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  proxy_id UUID REFERENCES public.proxies(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Matches
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT,
  sport TEXT NOT NULL CHECK (sport IN ('football', 'basketball', 'volleyball', 'tennis')),
  league_name TEXT NOT NULL,
  league_logo TEXT,
  home_team TEXT NOT NULL,
  home_logo TEXT,
  away_team TEXT NOT NULL,
  away_logo TEXT,
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished', 'postponed', 'cancelled')),
  home_score INTEGER,
  away_score INTEGER,
  source TEXT DEFAULT 'thesportsdb',
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(external_id, source)
);

-- Scheduled Posts
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'telegram', 'instagram')),
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  caption TEXT,
  image_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  minutes_before INTEGER DEFAULT 60,
  error_message TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_match_account UNIQUE (match_id, social_account_id)
);

-- Post History
CREATE TABLE IF NOT EXISTS public.post_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE SET NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  account_name TEXT,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  caption TEXT,
  image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  external_post_id TEXT,
  response_data JSONB DEFAULT '{}',
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Retweet Accounts
CREATE TABLE IF NOT EXISTS public.retweet_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  proxy_id UUID REFERENCES public.proxies(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  delay_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Retweet Configs
CREATE TABLE IF NOT EXISTS public.retweet_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  min_delay_seconds INTEGER DEFAULT 10,
  max_delay_seconds INTEGER DEFAULT 120,
  auto_rt_own_tweets BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Telegram Menus
CREATE TABLE IF NOT EXISTS public.telegram_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
  menu_name TEXT NOT NULL,
  menu_json JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tweet Templates
CREATE TABLE IF NOT EXISTS public.tweet_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  sport TEXT CHECK (sport IN ('football', 'basketball', 'volleyball', 'tennis', 'all')),
  is_default BOOLEAN DEFAULT false,
  variables JSONB DEFAULT '["home_team","away_team","league","date","time","venue"]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Image Templates
CREATE TABLE IF NOT EXISTS public.image_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sport TEXT CHECK (sport IN ('football', 'basketball', 'volleyball', 'tennis', 'all')),
  width INTEGER DEFAULT 1200,
  height INTEGER DEFAULT 675,
  bg_color TEXT DEFAULT '#1a1a2e',
  bg_image_url TEXT,
  layout JSONB NOT NULL DEFAULT '{
    "showLogos": true,
    "showLeague": true,
    "showDate": true,
    "showVenue": false,
    "fontFamily": "Inter",
    "teamNameSize": 36,
    "leagueNameSize": 20,
    "dateSize": 18,
    "primaryColor": "#ffffff",
    "accentColor": "#6172f3"
  }',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- BÖLÜM 3: RLS (Row Level Security)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proxies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retweet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retweet_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_templates ENABLE ROW LEVEL SECURITY;

-- Admin kontrolü (SECURITY DEFINER - RLS bypass eder)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- BÖLÜM 4: PROFILES POLİTİKALARI
-- =============================================

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (public.is_admin());

-- =============================================
-- BÖLÜM 5: AUTHENTICATED KULLANICI POLİTİKALARI
-- =============================================

CREATE POLICY "auth_select_sites" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_sites" ON public.sites FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "auth_select_proxies" ON public.proxies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_proxies" ON public.proxies FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "auth_select_social_accounts" ON public.social_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_social_accounts" ON public.social_accounts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "auth_select_matches" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_matches" ON public.matches FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "service_all_matches" ON public.matches FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "auth_select_scheduled_posts" ON public.scheduled_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_scheduled_posts" ON public.scheduled_posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "auth_insert_scheduled_posts" ON public.scheduled_posts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_select_post_history" ON public.post_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_post_history" ON public.post_history FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "auth_select_retweet_accounts" ON public.retweet_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_retweet_accounts" ON public.retweet_accounts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "auth_select_retweet_configs" ON public.retweet_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_retweet_configs" ON public.retweet_configs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "auth_select_telegram_menus" ON public.telegram_menus FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_telegram_menus" ON public.telegram_menus FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "auth_select_tweet_templates" ON public.tweet_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_tweet_templates" ON public.tweet_templates FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "auth_select_image_templates" ON public.image_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_image_templates" ON public.image_templates FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- =============================================
-- BÖLÜM 6: ANON (Scheduler/Backend) POLİTİKALARI
-- =============================================

CREATE POLICY "anon_select_matches" ON public.matches FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_matches" ON public.matches FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_matches" ON public.matches FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_sites" ON public.sites FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_social_accounts" ON public.social_accounts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_social_accounts" ON public.social_accounts FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_scheduled_posts" ON public.scheduled_posts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_scheduled_posts" ON public.scheduled_posts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_scheduled_posts" ON public.scheduled_posts FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_select_post_history" ON public.post_history FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_post_history" ON public.post_history FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_retweet_configs" ON public.retweet_configs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_retweet_accounts" ON public.retweet_accounts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_telegram_menus" ON public.telegram_menus FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_proxies" ON public.proxies FOR SELECT TO anon USING (true);

-- =============================================
-- BÖLÜM 7: TRIGGERS
-- =============================================

CREATE TRIGGER on_profile_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER sites_updated BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER social_accounts_updated BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER matches_updated BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER scheduled_posts_updated BEFORE UPDATE ON public.scheduled_posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER retweet_configs_updated BEFORE UPDATE ON public.retweet_configs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER telegram_menus_updated BEFORE UPDATE ON public.telegram_menus FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tweet_templates_updated BEFORE UPDATE ON public.tweet_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER image_templates_updated BEFORE UPDATE ON public.image_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Yeni auth kullanıcısı → otomatik profil
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
-- BÖLÜM 8: INDEXES
-- =============================================

CREATE INDEX idx_matches_date ON public.matches(match_date);
CREATE INDEX idx_matches_sport ON public.matches(sport);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_at ON public.scheduled_posts(scheduled_at);
CREATE INDEX idx_post_history_posted_at ON public.post_history(posted_at);
CREATE INDEX idx_post_history_status ON public.post_history(status);
CREATE INDEX idx_social_accounts_site ON public.social_accounts(site_id);
CREATE INDEX idx_social_accounts_platform ON public.social_accounts(platform);

-- =============================================
-- BÖLÜM 9: STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('match-images', 'match-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('site-logos', 'site-logos', true) ON CONFLICT (id) DO NOTHING;

-- match-images policies
CREATE POLICY "Public read match images" ON storage.objects FOR SELECT USING (bucket_id = 'match-images');
CREATE POLICY "Auth upload match images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'match-images');
CREATE POLICY "Anon upload match images" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'match-images');
CREATE POLICY "Auth delete match images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'match-images');
CREATE POLICY "Anon delete match images" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'match-images');

-- site-logos policies
CREATE POLICY "Public read site logos" ON storage.objects FOR SELECT USING (bucket_id = 'site-logos');
CREATE POLICY "Auth upload site logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-logos');
CREATE POLICY "Auth update site logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-logos');
CREATE POLICY "Auth delete site logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-logos');
CREATE POLICY "Anon read site logos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'site-logos');

-- =============================================
-- BÖLÜM 10: VARSAYILAN VERİLER
-- =============================================

INSERT INTO public.image_templates (name, sport, is_default, layout) VALUES
('Futbol Varsayılan', 'football', true, '{
  "showLogos": true, "showLeague": true, "showDate": true, "showVenue": true,
  "fontFamily": "Inter", "teamNameSize": 40, "leagueNameSize": 22, "dateSize": 18,
  "primaryColor": "#ffffff", "accentColor": "#6172f3"
}'),
('Basketbol Varsayılan', 'basketball', true, '{
  "showLogos": true, "showLeague": true, "showDate": true, "showVenue": false,
  "fontFamily": "Inter", "teamNameSize": 38, "leagueNameSize": 20, "dateSize": 18,
  "primaryColor": "#ffffff", "accentColor": "#f79009"
}'),
('Genel Şablon', 'all', true, '{
  "showLogos": true, "showLeague": true, "showDate": true, "showVenue": false,
  "fontFamily": "Inter", "teamNameSize": 36, "leagueNameSize": 20, "dateSize": 18,
  "primaryColor": "#ffffff", "accentColor": "#6172f3"
}');

-- =============================================
-- KURULUM TAMAMLANDI!
-- Şimdi bir kullanıcı kayıt olun ve admin yapmak için:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- =============================================
