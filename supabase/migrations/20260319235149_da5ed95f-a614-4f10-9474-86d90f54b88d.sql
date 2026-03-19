
-- Table to store AI analysis snapshots for historical tracking
CREATE TABLE public.intel_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('industry', 'subflow', 'cross-industry')),
  scope_key TEXT NOT NULL,
  analysis TEXT,
  gaps JSONB DEFAULT '[]'::jsonb,
  connections JSONB DEFAULT '[]'::jsonb,
  alerts JSONB DEFAULT '[]'::jsonb,
  live_data JSONB DEFAULT '{}'::jsonb,
  news JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient querying by scope
CREATE INDEX idx_intel_snapshots_scope ON public.intel_snapshots (scope_type, scope_key, created_at DESC);

-- Enable RLS (public read since no user auth)
ALTER TABLE public.intel_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow public read access (intel data is not user-specific)
CREATE POLICY "Anyone can read snapshots" ON public.intel_snapshots FOR SELECT USING (true);

-- Allow service role to insert
CREATE POLICY "Service role can insert snapshots" ON public.intel_snapshots FOR INSERT WITH CHECK (true);
