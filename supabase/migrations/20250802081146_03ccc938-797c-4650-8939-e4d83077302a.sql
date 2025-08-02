-- Създаване на enum за типове транзакции
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'bonus', 'room_fee', 'prize', 'refund');

-- Създаване на таблица за портфейли
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable за системния портфейл
  balance INTEGER NOT NULL DEFAULT 100, -- Стартов баланс 100 чипа
  is_glowter_wallet BOOLEAN NOT NULL DEFAULT false, -- За централния Глоутър портфейл
  wallet_name TEXT, -- За именуване на системни портфейли
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_wallet UNIQUE (user_id),
  CONSTRAINT unique_glowter_wallet CHECK (
    (is_glowter_wallet = false AND user_id IS NOT NULL) OR 
    (is_glowter_wallet = true AND user_id IS NULL)
  )
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
INSERT INTO public.wallets (user_id, balance, is_glowter_wallet, wallet_name)
VALUES (NULL, 0, true, 'Glowter Main Wallet');

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

-- Модифициране на съществуващия тригър за нови потребители
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

-- Функции за работа с портфейли
CREATE OR REPLACE FUNCTION public.get_glowter_wallet_id()
RETURNS UUID AS $$
  SELECT id FROM public.wallets WHERE is_glowter_wallet = true LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.transfer_chips(
  from_wallet_id UUID,
  to_wallet_id UUID,
  amount INTEGER,
  transaction_type transaction_type,
  description TEXT DEFAULT NULL,
  reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  from_balance INTEGER;
BEGIN
  -- Проверка на баланса на изпращащия портфейл
  SELECT balance INTO from_balance FROM public.wallets WHERE id = from_wallet_id;
  
  IF from_balance < amount THEN
    RETURN FALSE; -- Недостатъчен баланс
  END IF;
  
  -- Намаляване на баланса на изпращащия портфейл
  UPDATE public.wallets 
  SET balance = balance - amount 
  WHERE id = from_wallet_id;
  
  -- Увеличаване на баланса на получаващия портфейл
  UPDATE public.wallets 
  SET balance = balance + amount 
  WHERE id = to_wallet_id;
  
  -- Записване на транзакцията за изпращащия
  INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description, reference_id)
  VALUES (from_wallet_id, -amount, transaction_type, description, reference_id);
  
  -- Записване на транзакцията за получаващия
  INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description, reference_id)
  VALUES (to_wallet_id, amount, transaction_type, description, reference_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;