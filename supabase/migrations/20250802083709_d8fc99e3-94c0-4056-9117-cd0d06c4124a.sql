-- Създаване на портфейл за потребители без такъв
INSERT INTO public.wallets (user_id, balance)
SELECT u.id, 200
FROM auth.users u
LEFT JOIN public.wallets w ON w.user_id = u.id
WHERE w.id IS NULL AND u.id = '49f8d6e6-8291-49b2-8849-9c7ab6b5969c';

-- Създаване на транзакционен запис за новия портфейл
INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
SELECT w.id, 200, 'bonus', 'Начален баланс + административен бонус'
FROM public.wallets w
WHERE w.user_id = '49f8d6e6-8291-49b2-8849-9c7ab6b5969c'
AND NOT EXISTS (
  SELECT 1 FROM public.wallet_transactions wt WHERE wt.wallet_id = w.id
);