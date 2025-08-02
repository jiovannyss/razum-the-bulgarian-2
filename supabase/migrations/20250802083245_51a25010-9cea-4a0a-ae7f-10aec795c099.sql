-- Добавяне на 100 чипа към всички съществуващи потребители
UPDATE public.wallets 
SET balance = balance + 100 
WHERE is_glowter_wallet = false;

-- Създаване на транзакционни записи за добавените чипове
INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
SELECT 
  id as wallet_id,
  100 as amount,
  'bonus' as transaction_type,
  'Административен бонус - 100 чипа' as description
FROM public.wallets 
WHERE is_glowter_wallet = false;