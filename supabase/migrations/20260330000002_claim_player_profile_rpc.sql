-- Allow a player to "claim" an existing child profile created by a parent.
-- This avoids manual pairing in Supabase for each player signup.

-- Returns claimable player rows for a parent email.
create or replace function public.get_claimable_players_by_parent_email(p_parent_email text)
returns table (
  id uuid,
  name text,
  age int,
  school text,
  expertise_level text
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.name, p.age, p.school, p.expertise_level
  from public.players p
  join public.users u on u.id = p.parent_id
  where lower(u.email) = lower(p_parent_email)
    and p.player_user_id is null
  order by p.created_at desc nulls last, p.name asc;
$$;

grant execute on function public.get_claimable_players_by_parent_email(text) to authenticated;

-- Claims a specific player record (must belong to the given parent email).
create or replace function public.claim_player_profile(p_player_id uuid, p_parent_email text)
returns uuid
language plpgsql
security definer
set search_path = public
volatile
as $$
declare
  v_parent_id uuid;
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_parent_id
  from public.users
  where lower(email) = lower(p_parent_email)
  limit 1;

  if v_parent_id is null then
    raise exception 'Parent email not found';
  end if;

  update public.players
  set player_user_id = v_uid
  where id = p_player_id
    and parent_id = v_parent_id
    and player_user_id is null;

  if not found then
    raise exception 'Profile not claimable (already linked or wrong parent email)';
  end if;

  return p_player_id;
end;
$$;

grant execute on function public.claim_player_profile(uuid, text) to authenticated;

