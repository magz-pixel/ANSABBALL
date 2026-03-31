-- Announcements: only admins may delete (and fully manage). Coaches may still post new items.
-- Requires public.ansa_is_admin() from coach-scope migrations.

DROP POLICY IF EXISTS "Admin/coach manage announcements" ON public.announcements;

CREATE POLICY "Admins full access announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.ansa_is_admin())
  WITH CHECK (public.ansa_is_admin());

CREATE POLICY "Coaches insert announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'coach')
  );
