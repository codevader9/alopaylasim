-- 1. Duplicate scheduled posts temizle (her match+account için sadece 1 tane bırak)
DELETE FROM public.scheduled_posts
WHERE id NOT IN (
  SELECT DISTINCT ON (match_id, social_account_id) id
  FROM public.scheduled_posts
  ORDER BY match_id, social_account_id, created_at ASC
);

-- 2. Tekrarı önlemek için unique constraint ekle
ALTER TABLE public.scheduled_posts
  ADD CONSTRAINT unique_match_account
  UNIQUE (match_id, social_account_id);

-- Kaç post kaldı kontrol et
SELECT COUNT(*) as remaining FROM public.scheduled_posts;
