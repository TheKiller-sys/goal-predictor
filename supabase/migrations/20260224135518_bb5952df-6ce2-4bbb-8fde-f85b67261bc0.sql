
-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_id INTEGER UNIQUE,
  league TEXT NOT NULL,
  league_id INTEGER,
  season INTEGER,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_team_id INTEGER,
  away_team_id INTEGER,
  home_logo TEXT,
  away_logo TEXT,
  home_elo INTEGER DEFAULT 1500,
  away_elo INTEGER DEFAULT 1500,
  home_lambda NUMERIC(4,2) DEFAULT 1.0,
  away_lambda NUMERIC(4,2) DEFAULT 1.0,
  home_win_prob NUMERIC(4,3) DEFAULT 0.33,
  draw_prob NUMERIC(4,3) DEFAULT 0.33,
  away_win_prob NUMERIC(4,3) DEFAULT 0.33,
  home_odds NUMERIC(5,2),
  draw_odds NUMERIC(5,2),
  away_odds NUMERIC(5,2),
  kickoff TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  home_xg NUMERIC(4,2) DEFAULT 0,
  away_xg NUMERIC(4,2) DEFAULT 0,
  home_ppda NUMERIC(4,1) DEFAULT 0,
  away_ppda NUMERIC(4,1) DEFAULT 0,
  home_score INTEGER,
  away_score INTEGER,
  venue TEXT,
  round TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lineups table
CREATE TABLE public.lineups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  is_home BOOLEAN NOT NULL DEFAULT true,
  formation TEXT,
  players JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create odds_history table for tracking odds movements
CREATE TABLE public.odds_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  bookmaker TEXT,
  home_odds NUMERIC(5,2),
  draw_odds NUMERIC(5,2),
  away_odds NUMERIC(5,2),
  over25_odds NUMERIC(5,2),
  under25_odds NUMERIC(5,2),
  btts_yes_odds NUMERIC(5,2),
  btts_no_odds NUMERIC(5,2),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access (no auth required for this analytics platform)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odds_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public read access for lineups" ON public.lineups FOR SELECT USING (true);
CREATE POLICY "Public read access for odds_history" ON public.odds_history FOR SELECT USING (true);

-- Service role can insert/update (edge functions use service role)
CREATE POLICY "Service role full access matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access lineups" ON public.lineups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access odds_history" ON public.odds_history FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_matches_api_id ON public.matches(api_id);
CREATE INDEX idx_matches_kickoff ON public.matches(kickoff);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_lineups_match_id ON public.lineups(match_id);
CREATE INDEX idx_odds_match_id ON public.odds_history(match_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
