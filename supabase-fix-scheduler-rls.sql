-- Scheduler (anon role) için gerekli okuma/yazma izinleri
-- Scheduler server-side çalışıyor, anon key ile bağlanıyor

-- SELECT izinleri (scheduler maç, hesap, site bilgilerini okumalı)
CREATE POLICY "anon_select_matches" ON public.matches FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_sites" ON public.sites FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_social_accounts" ON public.social_accounts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_scheduled_posts" ON public.scheduled_posts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_post_history" ON public.post_history FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_retweet_configs" ON public.retweet_configs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_retweet_accounts" ON public.retweet_accounts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_telegram_menus" ON public.telegram_menus FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_proxies" ON public.proxies FOR SELECT TO anon USING (true);

-- INSERT izinleri (scheduler post oluşturmalı)
CREATE POLICY "anon_insert_scheduled_posts" ON public.scheduled_posts FOR INSERT TO anon WITH CHECK (true);

-- UPDATE izinleri (scheduler social_accounts credentials güncellemeli - login cookies)
CREATE POLICY "anon_update_social_accounts" ON public.social_accounts FOR UPDATE TO anon USING (true) WITH CHECK (true);
