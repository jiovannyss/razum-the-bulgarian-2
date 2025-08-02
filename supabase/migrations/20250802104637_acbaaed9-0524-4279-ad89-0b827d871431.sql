-- Update all bonus transactions with the exact Bulgarian text
UPDATE public.wallet_transactions 
SET description = 'Initial registration bonus'
WHERE transaction_type = 'bonus' 
  AND amount = 100
  AND description LIKE '%баланс при регистрация%';