-- Създаване на enum за типове транзакции
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'bonus', 'room_fee', 'prize', 'refund');

-- Създаване на таблица за портфейли
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 100, -- Стартов баланс 100 чипа
  is_glowter_wallet BOOLEAN NOT NULL DEFAULT false, -- За централния Глоутър портфейл
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Създаване на таблица за транзакции
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Положителни за депозити, отрицателни за тегления
  transaction_type transaction_type NOT NULL,
  description TEXT,
  reference_id UUID, -- За връзка с стаи, специални игри и т.н.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Създаване на Глоутър портфейл (системен)
INSERT INTO public.wallets (user_id, balance, is_glowter_wallet)
VALUES ('00000000-0000-0000-0000-000000000000', 0, true);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies за портфейли
CREATE POLICY "Потребителите могат да виждат собствения си портфейл"
ON public.wallets
FOR SELECT
USING (auth.uid() = user_id OR is_admin_or_above(auth.uid()));

CREATE POLICY "Само системата може да обновява портфейли"
ON public.wallets
FOR UPDATE
USING (is_admin_or_above(auth.uid()));

CREATE POLICY "Системата може да създава портфейли"
ON public.wallets
FOR INSERT
WITH CHECK (true);

-- RLS Policies за транзакции
CREATE POLICY "Потребителите могат да виждат собствените си транзакции"
ON public.wallet_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wallets w 
    WHERE w.id = wallet_id AND (w.user_id = auth.uid() OR is_admin_or_above(auth.uid()))
  )
);

CREATE POLICY "Само системата може да създава транзакции"
ON public.wallet_transactions
FOR INSERT
WITH CHECK (true);

-- Тригъри за обновяване на updated_at
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Функция за създаване на портфейл при регистрация
CREATE OR REPLACE FUNCTION public.create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  -- Създаване на портфейл с 100 чипа
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 100);
  
  -- Записване на началната транзакция
  INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
  SELECT w.id, 100, 'bonus', 'Начален бонус при регистрация'
  FROM public.wallets w
  WHERE w.user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Модифициране на съществуващия тригър за нови потребители
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
  
  -- Записване на началната транзакция
  INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
  SELECT w.id, 100, 'bonus', 'Начален бонус при регистрация'
  FROM public.wallets w
  WHERE w.user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Възстановяване на тригъра
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();