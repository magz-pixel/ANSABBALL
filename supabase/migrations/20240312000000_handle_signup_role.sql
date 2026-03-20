-- Update trigger to set role from signup metadata (parent, player, coach only)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  signup_role user_role;
BEGIN
  -- Only allow parent, player, coach from signup. Admin must be set manually.
  IF NEW.raw_user_meta_data->>'role' IN ('parent', 'player', 'coach') THEN
    signup_role := (NEW.raw_user_meta_data->>'role')::user_role;
  ELSE
    signup_role := 'player'::user_role;
  END IF;

  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    signup_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
