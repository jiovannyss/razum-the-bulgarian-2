-- Поправяне на search_path за функциите
CREATE OR REPLACE FUNCTION public.get_glowter_wallet_id()
RETURNS UUID 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT id FROM public.wallets WHERE is_glowter_wallet = true LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.transfer_chips(
  from_wallet_id UUID,
  to_wallet_id UUID,
  amount INTEGER,
  transaction_type transaction_type,
  description TEXT DEFAULT NULL,
  reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;