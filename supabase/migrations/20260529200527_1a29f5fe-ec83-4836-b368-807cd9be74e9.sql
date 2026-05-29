CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  template_ids JSONB NOT NULL,
  amount_in_cents INTEGER NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

GRANT ALL ON public.checkout_sessions TO service_role;

ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role only" ON public.checkout_sessions;
CREATE POLICY "service role only" ON public.checkout_sessions
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

-- Ensure legal_pages.slug is unique so we can upsert by slug
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'legal_pages_slug_key'
  ) THEN
    ALTER TABLE public.legal_pages ADD CONSTRAINT legal_pages_slug_key UNIQUE (slug);
  END IF;
END $$;