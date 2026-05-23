
-- has_role function (security definer to avoid RLS recursion)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  preview_image TEXT,
  canva_link TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  items JSONB NOT NULL,
  amount_in_cents INTEGER NOT NULL,
  yoco_charge_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.careers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT,
  type TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  overview TEXT,
  responsibilities JSONB,
  requirements JSONB,
  compensation TEXT,
  what_we_offer JSONB,
  who_for TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.legal_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.template_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  suggestion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_waitlist ENABLE ROW LEVEL SECURITY;

-- Templates: public read published
CREATE POLICY "public read published templates" ON public.templates
  FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "admin manage templates" ON public.templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Hide canva_link column from public/authenticated readers (admin uses service role)
REVOKE SELECT (canva_link) ON public.templates FROM anon;
REVOKE SELECT (canva_link) ON public.templates FROM authenticated;

-- Orders: admin read
CREATE POLICY "admin read orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Submissions: anyone insert, admin read
CREATE POLICY "anyone insert submissions" ON public.submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "admin read submissions" ON public.submissions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Careers
CREATE POLICY "public read open careers" ON public.careers
  FOR SELECT TO anon, authenticated
  USING (status IN ('open', 'closed'));
CREATE POLICY "admin manage careers" ON public.careers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Legal
CREATE POLICY "public read legal pages" ON public.legal_pages
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "admin write legal pages" ON public.legal_pages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Waitlist
CREATE POLICY "anyone join waitlist" ON public.template_waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "admin manage waitlist" ON public.template_waitlist
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE POLICY "users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "admin read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles
CREATE POLICY "admin manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed careers
INSERT INTO public.careers (title, location, type, department, status, overview, responsibilities, requirements, compensation, who_for) VALUES
(
  'Sales Spotter (Commission-Only)',
  'Remote · South Africa',
  'Freelance',
  'Sales',
  'open',
  'Refer qualified businesses to Capacitiq and earn 15% of their first invoice. Ideal for connectors with strong professional networks.',
  '["Identify businesses that could benefit from Capacitiq services", "Make an introduction or warm referral", "Submit the referral via the Spotters form", "Earn 15% of the referred client first invoice upon payment"]'::jsonb,
  '["Strong professional network", "Comfortable making warm introductions", "No formal qualification required"]'::jsonb,
  '15% of first invoice on every referred client that signs and pays.',
  'Self-driven connectors with strong professional networks who are comfortable making warm introductions.'
),
(
  'Client Acquisition Specialist (Commission-Based Independent Contractor)',
  'Remote · South Africa',
  'Freelance — Commission Only',
  'Sales',
  'closed',
  'A commission-based independent contractor role focused on identifying, engaging, and converting new business opportunities through direct outreach and structured client communication.',
  '["Identify and research potential clients across South Africa", "Conduct cold outreach to business owners and decision-makers", "Engage prospects and present services using approved materials", "Follow up consistently to convert leads into active clients", "Manage your own pipeline from first contact to closed deal", "Maintain professional communication throughout the client journey"]'::jsonb,
  '["Self-driven and disciplined without supervision", "Comfortable with commission-based earnings", "Confident initiating conversations with business owners", "No formal qualification or prior agency experience required"]'::jsonb,
  'Commission-based only. No fixed salary. Earn commission on every retainer client closed paid monthly for as long as client remains active. Earn commission on once-off projects upon completion and payment.',
  'Self-driven individuals who are motivated by performance, comfortable with commission-only earnings, and confident initiating conversations with business owners.'
);
