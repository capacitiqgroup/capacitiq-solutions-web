-- Add discount_payment_link column
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS discount_payment_link TEXT;

-- Create abandoned_carts table
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  cart_items JSONB NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.abandoned_carts TO service_role;

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin read abandoned_carts"
ON public.abandoned_carts FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin delete abandoned_carts"
ON public.abandoned_carts FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));