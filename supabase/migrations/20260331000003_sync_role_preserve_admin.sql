-- sync_public_user_role_from_auth must NEVER overwrite an existing admin (or downgrade staff).
-- Auth user_metadata may still say "coach" from signup while public.users was set to admin manually.

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
      AND role IS DISTINCT FROM v_role::user_role
      AND role <> 'admin'::user_role;
  END IF;
END;
$$;
