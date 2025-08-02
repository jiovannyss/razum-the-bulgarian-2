-- Установяване на баланса на всички потребители на точно 100 чипа
UPDATE public.wallets 
SET balance = 100 
WHERE is_glowter_wallet = false;

-- Изтриване на всички съществуващи транзакции за потребителски портфейли
DELETE FROM public.wallet_transactions 
WHERE wallet_id IN (
  SELECT id FROM public.wallets WHERE is_glowter_wallet = false
);

-- Създаване на нови транзакции само за начален баланс
INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
SELECT 
  id as wallet_id,
  100 as amount,
  'bonus' as transaction_type,
  'Начален баланс при регистрация' as description
FROM public.wallets 
WHERE is_glowter_wallet = false;