
-- Tighten submissions: drop public insert, only service role can insert
DROP POLICY IF EXISTS "anyone insert submissions" ON public.submissions;

-- Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text,
  author text DEFAULT 'Capacitiq Team',
  status text NOT NULL DEFAULT 'published',
  publish_date date DEFAULT CURRENT_DATE,
  published_at timestamptz DEFAULT now(),
  excerpt text,
  featured_image text,
  tags text[],
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published blog" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "admin manage blog" ON public.blog_posts FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Portfolio items
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  category text,
  excerpt text,
  hero_image text,
  sections jsonb,
  tags text[],
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published portfolio" ON public.portfolio_items FOR SELECT USING (status = 'published');
CREATE POLICY "admin manage portfolio" ON public.portfolio_items FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name text NOT NULL,
  reviewer_photo_url text,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text NOT NULL,
  review_date date NOT NULL DEFAULT CURRENT_DATE,
  source text NOT NULL DEFAULT 'Google',
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read visible reviews" ON public.reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "admin manage reviews" ON public.reviews FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Review requests (queue table)
CREATE TABLE IF NOT EXISTS public.review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  template_name text,
  order_id text,
  send_after timestamptz NOT NULL DEFAULT (now() + interval '3 days'),
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage review_requests" ON public.review_requests FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
