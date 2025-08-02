-- Update existing bonus transactions to English
UPDATE public.wallet_transactions 
SET description = 'Initial registration bonus'
WHERE description = 'Начален бонус при регистрация' 
  AND transaction_type = 'bonus' 
  AND amount = 100;