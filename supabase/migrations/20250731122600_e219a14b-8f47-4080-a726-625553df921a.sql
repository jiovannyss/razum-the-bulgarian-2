-- RLS политики за matches
CREATE POLICY "Всички могат да виждат мачове"
  ON public.matches
  FOR SELECT
  USING (true);

CREATE POLICY "Администраторите могат да управляват мачове"
  ON public.matches
  FOR ALL
  USING (public.is_admin_or_above(auth.uid()));

-- RLS политики за special_games
CREATE POLICY "Всички могат да виждат специални игри"
  ON public.special_games
  FOR SELECT
  USING (true);

CREATE POLICY "Администраторите могат да управляват специални игри"
  ON public.special_games
  FOR ALL
  USING (public.is_admin_or_above(auth.uid()));

-- RLS политики за special_game_matches
CREATE POLICY "Всички могат да виждат връзки специални игри-мачове"
  ON public.special_game_matches
  FOR SELECT
  USING (true);

CREATE POLICY "Администраторите могат да управляват връзки специални игри-мачове"
  ON public.special_game_matches
  FOR ALL
  USING (public.is_admin_or_above(auth.uid()));