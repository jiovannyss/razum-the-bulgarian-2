-- Добавяне на case-insensitive уникален индекс за username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx 
ON public.profiles (LOWER(username)) 
WHERE username IS NOT NULL;

-- Добавяне на case-insensitive уникален индекс за email
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_idx 
ON public.profiles (LOWER(email)) 
WHERE email IS NOT NULL;

-- Функция за case-insensitive търсене на потребител по email или username
CREATE OR REPLACE FUNCTION public.find_user_profile(search_term text)
RETURNS TABLE (
  user_id uuid,
  email text,
  username text,
  full_name text
) 
LANGUAGE sql
SECURITY DEFINER
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

-- Тригер за автоматично конвертиране на email и username на малки букви при insert/update
CREATE OR REPLACE FUNCTION public.normalize_profile_data()
RETURNS TRIGGER 
LANGUAGE plpgsql
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

-- Прилагане на тригера към profiles таблицата
DROP TRIGGER IF EXISTS normalize_profile_data_trigger ON public.profiles;
CREATE TRIGGER normalize_profile_data_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_profile_data();

-- Нормализиране на съществуващите данни
UPDATE public.profiles 
SET 
  email = LOWER(email),
  username = LOWER(username)
WHERE email IS NOT NULL OR username IS NOT NULL;