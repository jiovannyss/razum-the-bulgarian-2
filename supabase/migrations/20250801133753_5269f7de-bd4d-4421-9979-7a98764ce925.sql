-- Добавяне на нови полета от API v4
-- 1. Добавяне на нови полета в cached_competitions
ALTER TABLE cached_competitions 
ADD COLUMN IF NOT EXISTS type TEXT;

-- 2. Добавяне на нови полета в cached_fixtures  
ALTER TABLE cached_fixtures 
ADD COLUMN IF NOT EXISTS minute INTEGER,
ADD COLUMN IF NOT EXISTS injury_time INTEGER,
ADD COLUMN IF NOT EXISTS attendance INTEGER;

-- 3. Добавяне на нови полета в cached_teams
ALTER TABLE cached_teams 
ADD COLUMN IF NOT EXISTS coach_name TEXT,
ADD COLUMN IF NOT EXISTS coach_nationality TEXT,
ADD COLUMN IF NOT EXISTS league_rank INTEGER;

-- Коментари за новите полета
COMMENT ON COLUMN cached_competitions.type IS 'Тип състезание: LEAGUE, CUP, etc.';
COMMENT ON COLUMN cached_fixtures.minute IS 'Минута на мача (ако е в ход)';
COMMENT ON COLUMN cached_fixtures.injury_time IS 'Добавено време в минути';
COMMENT ON COLUMN cached_fixtures.attendance IS 'Брой зрители на мача';
COMMENT ON COLUMN cached_teams.coach_name IS 'Име на треньора';
COMMENT ON COLUMN cached_teams.coach_nationality IS 'Националност на треньора';
COMMENT ON COLUMN cached_teams.league_rank IS 'Позиция в лигата (ако е налична)';