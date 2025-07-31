-- Поправяне на функцията за автоматично обновяване на updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Индекси за по-добра производителност
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_matches_date ON public.matches(match_date);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_rooms_access_code ON public.rooms(access_code);
CREATE INDEX idx_room_participants_room_user ON public.room_participants(room_id, user_id);
CREATE INDEX idx_predictions_user_match ON public.predictions(user_id, match_id);
CREATE INDEX idx_predictions_room ON public.predictions(room_id);