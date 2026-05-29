-- Defaults for content tables to make Supabase dashboard inserts easy
ALTER TABLE public.blog_posts 
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN status SET DEFAULT 'published',
  ALTER COLUMN author SET DEFAULT 'Capacitiq Team';

ALTER TABLE public.portfolio_items
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN status SET DEFAULT 'published';

ALTER TABLE public.templates
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN status SET DEFAULT 'published';

ALTER TABLE public.reviews
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN is_visible SET DEFAULT true,
  ALTER COLUMN source SET DEFAULT 'Google';

ALTER TABLE public.careers
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN status SET DEFAULT 'open';

ALTER TABLE public.template_waitlist
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Document expected JSONB formats
COMMENT ON COLUMN public.portfolio_items.sections IS 'JSONB array: [{"heading": "Section Title", "body": "Section content here."}]';
COMMENT ON COLUMN public.portfolio_items.tags IS 'TEXT[] array: ["tag1", "tag2", "tag3"]';
COMMENT ON COLUMN public.blog_posts.tags IS 'TEXT[] array: ["tag1", "tag2", "tag3"]';
