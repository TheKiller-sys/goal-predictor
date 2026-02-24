
-- Drop overly permissive policies
DROP POLICY "Service role full access matches" ON public.matches;
DROP POLICY "Service role full access lineups" ON public.lineups;
DROP POLICY "Service role full access odds_history" ON public.odds_history;

-- Restrict write access to service role only (edge functions)
CREATE POLICY "Service role insert matches" ON public.matches FOR INSERT WITH CHECK (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);
CREATE POLICY "Service role update matches" ON public.matches FOR UPDATE USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);
CREATE POLICY "Service role delete matches" ON public.matches FOR DELETE USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

CREATE POLICY "Service role insert lineups" ON public.lineups FOR INSERT WITH CHECK (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);
CREATE POLICY "Service role update lineups" ON public.lineups FOR UPDATE USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);
CREATE POLICY "Service role delete lineups" ON public.lineups FOR DELETE USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

CREATE POLICY "Service role insert odds_history" ON public.odds_history FOR INSERT WITH CHECK (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);
CREATE POLICY "Service role update odds_history" ON public.odds_history FOR UPDATE USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);
CREATE POLICY "Service role delete odds_history" ON public.odds_history FOR DELETE USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);
