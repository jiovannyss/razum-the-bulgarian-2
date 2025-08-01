-- Create H2H cache table for head-to-head matches
CREATE TABLE public.cached_h2h_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team1_id integer NOT NULL,
  team2_id integer NOT NULL,
  match_id integer NOT NULL,
  competition_id integer NOT NULL,
  season_year integer NOT NULL,
  utc_date timestamp with time zone NOT NULL,
  home_team_id integer NOT NULL,
  away_team_id integer NOT NULL,
  home_score integer,
  away_score integer,
  status text NOT NULL,
  winner text,
  venue text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team1_id, team2_id, match_id)
);

-- Enable RLS
ALTER TABLE public.cached_h2h_matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Всички могат да виждат H2H мачове" 
ON public.cached_h2h_matches 
FOR SELECT 
USING (true);

CREATE POLICY "Админи могат да управляват H2H мачове" 
ON public.cached_h2h_matches 
FOR ALL 
USING (is_admin_or_above(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_cached_h2h_team1_team2 ON public.cached_h2h_matches(team1_id, team2_id);
CREATE INDEX idx_cached_h2h_team2_team1 ON public.cached_h2h_matches(team2_id, team1_id);
CREATE INDEX idx_cached_h2h_date ON public.cached_h2h_matches(utc_date DESC);

-- Create team form cache table
CREATE TABLE public.cached_team_form (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id integer NOT NULL UNIQUE,
  match1_result text, -- Most recent match (W/D/L)
  match2_result text,
  match3_result text,
  match4_result text,
  match5_result text, -- Oldest of the 5 matches
  form_string text GENERATED ALWAYS AS (
    COALESCE(match1_result, '') || 
    COALESCE(match2_result, '') || 
    COALESCE(match3_result, '') || 
    COALESCE(match4_result, '') || 
    COALESCE(match5_result, '')
  ) STORED,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cached_team_form ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Всички могат да виждат форма на отборите" 
ON public.cached_team_form 
FOR SELECT 
USING (true);

CREATE POLICY "Админи могат да управляват форма на отборите" 
ON public.cached_team_form 
FOR ALL 
USING (is_admin_or_above(auth.uid()));

-- Create index for performance
CREATE INDEX idx_cached_team_form_team_id ON public.cached_team_form(team_id);