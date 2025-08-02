-- Създаване на портфейли за всички потребители без такива
INSERT INTO public.wallets (user_id, balance)
SELECT u.id, 100
FROM auth.users u
LEFT JOIN public.wallets w ON w.user_id = u.id
WHERE w.id IS NULL;

-- Създаване на транзакционни записи за новите портфейли
INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, description)
SELECT w.id, 100, 'bonus', 'Начален баланс при регистрация'
FROM public.wallets w
WHERE w.user_id IN (
  SELECT u.id
  FROM auth.users u
  LEFT JOIN public.wallet_transactions wt ON wt.wallet_id = (
    SELECT w2.id FROM public.wallets w2 WHERE w2.user_id = u.id LIMIT 1
  )
  WHERE wt.id IS NULL
) AND w.is_glowter_wallet = false;