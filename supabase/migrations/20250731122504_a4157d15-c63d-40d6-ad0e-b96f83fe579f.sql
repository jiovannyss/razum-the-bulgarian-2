-- Таблица за мачове
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  competition TEXT NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, live, finished, postponed
  external_id TEXT, -- за API интеграции
  admin_rating INTEGER CHECK (admin_rating >= 1 AND admin_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица за специални игри
CREATE TABLE public.special_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Връзка между специални игри и мачове
CREATE TABLE public.special_game_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  special_game_id UUID NOT NULL REFERENCES public.special_games(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  points_multiplier DECIMAL(3,2) DEFAULT 1.0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(special_game_id, match_id)
);

-- Активиране на RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_game_matches ENABLE ROW LEVEL SECURITY;