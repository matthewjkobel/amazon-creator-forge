-- Fix remaining search_path issues for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'full_name'), new.email),
    (new.raw_user_meta_data ->> 'avatar_url')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;