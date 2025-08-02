-- Поправяне на функцията за търсене с добавяне на search_path
CREATE OR REPLACE FUNCTION public.find_user_profile(search_term text)
RETURNS TABLE (
  user_id uuid,
  email text,
  username text,
  full_name text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    p.user_id,
    p.email,
    p.username,
    p.full_name
  FROM public.profiles p
  WHERE 
    LOWER(p.email) = LOWER(search_term) 
    OR LOWER(p.username) = LOWER(search_term)
  LIMIT 1;
$$;

-- Поправяне на normalize функцията с добавяне на search_path
CREATE OR REPLACE FUNCTION public.normalize_profile_data()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Нормализиране на email към малки букви
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(NEW.email);
  END IF;
  
  -- Нормализиране на username към малки букви
  IF NEW.username IS NOT NULL THEN
    NEW.username = LOWER(NEW.username);
  END IF;
  
  RETURN NEW;
END;
$$;