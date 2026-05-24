
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS launch_price integer,
  ADD COLUMN IF NOT EXISTS standard_price integer;

UPDATE public.templates SET launch_price = price WHERE launch_price IS NULL;
