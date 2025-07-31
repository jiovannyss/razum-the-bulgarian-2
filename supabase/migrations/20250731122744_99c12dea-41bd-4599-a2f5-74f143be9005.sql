-- RLS политики за rooms
CREATE POLICY "Всички могат да виждат публични стаи"
  ON public.rooms
  FOR SELECT
  USING (NOT is_private OR auth.uid() = created_by OR public.is_admin_or_above(auth.uid()));

CREATE POLICY "Потребителите могат да създават стаи"
  ON public.rooms
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Създателите и администраторите могат да редактират стаи"
  ON public.rooms
  FOR UPDATE
  USING (auth.uid() = created_by OR public.is_admin_or_above(auth.uid()));

CREATE POLICY "Администраторите могат да изтриват стаи"
  ON public.rooms
  FOR DELETE
  USING (public.is_admin_or_above(auth.uid()));

-- RLS политики за room_participants
CREATE POLICY "Участниците могат да виждат други участници в стаята"
  ON public.room_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.room_participants rp
      WHERE rp.room_id = room_participants.room_id
        AND rp.user_id = auth.uid()
        AND rp.is_active = true
    )
    OR public.is_admin_or_above(auth.uid())
  );

CREATE POLICY "Потребителите могат да се присъединяват към стаи"
  ON public.room_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Потребителите могат да напускат стаи"
  ON public.room_participants
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin_or_above(auth.uid()));

-- RLS политики за predictions
CREATE POLICY "Потребителите могат да виждат собствените си прогнози"
  ON public.predictions
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_or_above(auth.uid()));

CREATE POLICY "Потребителите могат да създават прогнози"
  ON public.predictions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Потребителите могат да редактират собствените си прогнози"
  ON public.predictions
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin_or_above(auth.uid()));