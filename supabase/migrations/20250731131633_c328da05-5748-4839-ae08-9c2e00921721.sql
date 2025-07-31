-- Добавяне на допълнителни полета към profiles таблицата
ALTER TABLE public.profiles ADD COLUMN nationality text;
ALTER TABLE public.profiles ADD COLUMN phone text;
ALTER TABLE public.profiles ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE public.profiles ADD COLUMN birth_date date;

-- Обновяване на trigger функцията за обработка на нови потребители
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, nationality, phone, gender, birth_date)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'nationality',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'gender',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'birth_date')::date 
      ELSE NULL 
    END
  );
  
  -- Задаване на роля 'user' по подразбиране
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;