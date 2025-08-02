-- Премахване на триггера който автоматично конвертира към малки букви
DROP TRIGGER IF EXISTS normalize_profile_data_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.normalize_profile_data();

-- Обновяване на find_user_profile функцията да търси case-insensitive но връща оригиналните данни
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

-- Върнемахме оригиналните данни с правилния регистър на буквите
-- (Ще върнем обратно оригиналните стойности там където е възможно)
UPDATE public.profiles 
SET 
  email = CASE 
    WHEN email = 'jiovannyss@gmail.com' THEN 'jiovannyss@gmail.com'
    WHEN email = 'admin@razum.bg' THEN 'admin@razum.bg'
    WHEN email = 'ivan.ivanov@ehotels-bg.com' THEN 'ivan.ivanov@ehotels-bg.com'
    WHEN email = 'ivan.ivanov@gbg.bg' THEN 'ivan.ivanov@gbg.bg'
    WHEN email = 'ivan.ivanov@24travel.bg' THEN 'ivan.ivanov@24travel.bg'
    ELSE email 
  END,
  username = CASE 
    WHEN username = 'jiovanny' THEN 'Jiovanny'
    ELSE username 
  END;