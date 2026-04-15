-- matches tablosuna anon key ile INSERT/UPDATE izni
-- (TheSportsDB servisi ve scheduler auth olmadan yazıyor)
CREATE POLICY "anon_insert_matches" ON public.matches
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_matches" ON public.matches
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- post_history tablosuna da INSERT izni
CREATE POLICY "anon_insert_post_history" ON public.post_history
  FOR INSERT TO anon WITH CHECK (true);

-- scheduled_posts tablosuna UPDATE izni (scheduler status güncelliyor)
CREATE POLICY "anon_update_scheduled_posts" ON public.scheduled_posts
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
