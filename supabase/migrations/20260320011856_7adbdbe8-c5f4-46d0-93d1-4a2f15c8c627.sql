-- Raw market data collected by System 1 (Data Collector)
CREATE TABLE public.raw_market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL,
  data_type text NOT NULL,
  geo_scope text DEFAULT 'global',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  industry text,
  tags text[] DEFAULT '{}'::text[],
  expires_at timestamptz
);

ALTER TABLE public.raw_market_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read raw data" ON public.raw_market_data FOR SELECT TO public USING (true);
CREATE POLICY "Service can insert raw data" ON public.raw_market_data FOR INSERT TO public WITH CHECK (true);

CREATE INDEX idx_raw_market_source ON public.raw_market_data(source, data_type);
CREATE INDEX idx_raw_market_geo ON public.raw_market_data(geo_scope);
CREATE INDEX idx_raw_market_created ON public.raw_market_data(created_at DESC);
CREATE INDEX idx_raw_market_industry ON public.raw_market_data(industry);

-- Intel matches found by System 2 (Analyzer)
CREATE TABLE public.intel_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  match_type text NOT NULL,
  title text NOT NULL,
  description text,
  industries text[] DEFAULT '{}'::text[],
  geo_context text[] DEFAULT '{}'::text[],
  estimated_value text,
  confidence numeric DEFAULT 0,
  source_insights uuid[] DEFAULT '{}'::uuid[],
  raw_data_refs uuid[] DEFAULT '{}'::uuid[],
  status text DEFAULT 'new',
  action_items jsonb DEFAULT '[]'::jsonb,
  challenges jsonb DEFAULT '[]'::jsonb,
  collaborators jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.intel_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read matches" ON public.intel_matches FOR SELECT TO public USING (true);
CREATE POLICY "Service can insert matches" ON public.intel_matches FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Service can update matches" ON public.intel_matches FOR UPDATE TO public USING (true);

CREATE INDEX idx_matches_type ON public.intel_matches(match_type);
CREATE INDEX idx_matches_status ON public.intel_matches(status);
CREATE INDEX idx_matches_created ON public.intel_matches(created_at DESC);
CREATE INDEX idx_matches_confidence ON public.intel_matches(confidence DESC);

-- Add update policy to intel_insights so System 3 can update reference counts
CREATE POLICY "Service can update insights" ON public.intel_insights FOR UPDATE TO public USING (true);

-- Enable pg_cron and pg_net for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;