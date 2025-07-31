-- Функция за проверка на роли (security definer за избягване на рекурсия в RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Функция за проверка дали потребителят е администратор или по-висока роля
CREATE OR REPLACE FUNCTION public.is_admin_or_above(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- Активиране на RLS за profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Активиране на RLS за user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;