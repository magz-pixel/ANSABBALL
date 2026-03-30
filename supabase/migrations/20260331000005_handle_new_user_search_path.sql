-- Fix "Database error saving new user" on sign-up: trigger must resolve public.user_role and public.users
-- reliably. Without SET search_path, casts to user_role can fail inside SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  signup_role user_role;
  v_role text;
  meta jsonb;
  v_full text;
  v_avatar text;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

  v_role := COALESCE(
    NULLIF(trim(meta->>'role'), ''),
    NULLIF(trim(meta->>'user_role'), ''),
    NULLIF(trim(meta->>'signup_role'), ''),
    NULLIF(trim(meta #>> '{user_metadata,role}'), ''),
    NULLIF(trim((meta->'user_metadata'->>'role')), ''),
    NULLIF(trim(meta #>> '{user_metadata,signup_role}'), ''),
    NULLIF(trim((meta->'user_metadata'->>'signup_role')), '')
  );

  IF v_role IN ('parent', 'player', 'coach') THEN
    signup_role := v_role::user_role;
  ELSE
    signup_role := 'player'::user_role;
  END IF;

  v_full := COALESCE(
    NULLIF(trim(meta->>'full_name'), ''),
    NULLIF(trim(meta->>'name'), ''),
    NULLIF(trim(meta #>> '{user_metadata,full_name}'), ''),
    NULLIF(trim((meta->'user_metadata'->>'full_name')), ''),
    NULLIF(trim(meta #>> '{user_metadata,name}'), '')
  );

  v_avatar := COALESCE(
    NULLIF(trim(meta->>'avatar_url'), ''),
    NULLIF(trim(meta #>> '{user_metadata,avatar_url}'), ''),
    NULLIF(trim((meta->'user_metadata'->>'avatar_url')), '')
  );

  INSERT INTO public.users (id, email, full_name, avatar_url, role, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    v_full,
    v_avatar,
    signup_role,
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Keep login-time role sync aligned with signup metadata keys (including signup_role fallback).
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
    NULLIF(trim(meta->>'signup_role'), ''),
    NULLIF(trim(meta #>> '{user_metadata,role}'), ''),
    NULLIF(trim((meta->'user_metadata'->>'role')), ''),
    NULLIF(trim(meta #>> '{user_metadata,signup_role}'), ''),
    NULLIF(trim((meta->'user_metadata'->>'signup_role')), '')
  );

  IF v_role IN ('parent', 'player', 'coach') THEN
    UPDATE public.users
    SET role = v_role::user_role
    WHERE id = auth.uid()
      AND role IS DISTINCT FROM v_role::user_role
      AND role <> 'admin'::user_role;
  END IF;
END;
$$;
