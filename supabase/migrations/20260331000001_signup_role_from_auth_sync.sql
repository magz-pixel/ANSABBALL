-- Reliable signup role: read role from auth metadata (multiple JSON paths) + RPC to sync public.users from auth.users after login.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  signup_role user_role;
  v_role text;
  meta jsonb;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

  -- Supabase / GoTrue may store user-supplied fields at root or under user_metadata
  v_role := COALESCE(
    NULLIF(trim(meta->>'role'), ''),
    NULLIF(trim(meta->>'user_role'), ''),
    NULLIF(trim(meta #>> '{user_metadata,role}'), ''),
    NULLIF(trim((meta->'user_metadata'->>'role')), '')
  );

  IF v_role IN ('parent', 'player', 'coach') THEN
    signup_role := v_role::user_role;
  ELSE
    signup_role := 'player'::user_role;
  END IF;

  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(meta->>'full_name', meta->>'name', meta #>> '{user_metadata,full_name}'),
    COALESCE(meta->>'avatar_url', meta #>> '{user_metadata,avatar_url}'),
    signup_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call after sign-in / session start: copy role from auth.users.raw_user_meta_data into public.users (fixes drift & email-confirm flows)
CREATE OR REPLACE FUNCTION public.sync_public_user_role_from_auth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb;
  v_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(raw_user_meta_data, '{}'::jsonb) INTO meta FROM auth.users WHERE id = auth.uid();
  IF meta IS NULL THEN
    RETURN;
  END IF;

  v_role := COALESCE(
    NULLIF(trim(meta->>'role'), ''),
    NULLIF(trim(meta->>'user_role'), ''),
    NULLIF(trim(meta #>> '{user_metadata,role}'), ''),
    NULLIF(trim((meta->'user_metadata'->>'role')), '')
  );

  IF v_role IN ('parent', 'player', 'coach') THEN
    UPDATE public.users
    SET role = v_role::user_role
    WHERE id = auth.uid()
      AND role IS DISTINCT FROM v_role::user_role;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_public_user_role_from_auth() TO authenticated;
