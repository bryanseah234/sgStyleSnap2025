-- Keepalive table for GitHub Actions to write real DB activity every 3 days.
-- Prevents Supabase free tier from pausing after 7 days of inactivity.
-- Run once in Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.keepalive_logs (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    pinged_at TIMESTAMPTZ DEFAULT NOW(),
    source    TEXT        DEFAULT 'github-actions'
);

ALTER TABLE public.keepalive_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_keepalive" ON public.keepalive_logs
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

GRANT SELECT, INSERT, DELETE ON public.keepalive_logs TO anon;
GRANT SELECT, INSERT, DELETE ON public.keepalive_logs TO authenticated;
