-- Update the initial bonus transaction description to English
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Създаване на профил
  INSERT INTO public.profiles (user_id, email, username, full_name, nationality, phone, gender, birth_date)
  VALUES (
    NEW.id,
    NEW.email,
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
  
  -- Създаване на портфейл с 100 чипа
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 100);
  
  -- Записване на началната транзакция с английско описание
  INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
  SELECT w.id, 100, 'bonus', 'Initial registration bonus'
  FROM public.wallets w
  WHERE w.user_id = NEW.id;
  
  RETURN NEW;
END;
$function$