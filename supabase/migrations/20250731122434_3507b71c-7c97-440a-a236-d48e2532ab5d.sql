-- Поправяне на функциите с правилен search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_above(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- RLS политики за profiles
CREATE POLICY "Всички могат да виждат профили"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Потребителите могат да редактират собствените си профили"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Администраторите могат да редактират всички профили"
  ON public.profiles
  FOR ALL
  USING (public.is_admin_or_above(auth.uid()));

-- RLS политики за user_roles
CREATE POLICY "Всички могат да виждат роли"
  ON public.user_roles
  FOR SELECT
  USING (true);

CREATE POLICY "Само супер администраторите могат да управляват роли"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));