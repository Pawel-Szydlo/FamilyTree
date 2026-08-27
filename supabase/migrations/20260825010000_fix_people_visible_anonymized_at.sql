-- Keep the view contract aligned with the people queries and Person type.
create or replace view public.people_visible
with (security_invoker = true)
as
select
  id,
  family_id,
  first_name,
  last_name,
  preferred_name,
  biography,
  avatar_path,
  birth_day,
  birth_month,
  case
    when birth_year_visible or not is_living or created_by = auth.uid()
      or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[])
    then birth_year
    else null
  end as birth_year,
  case
    when birth_year_visible or not is_living or created_by = auth.uid()
      or public.has_family_role(family_id, array['owner', 'admin']::public.family_member_role[])
    then birth_year_visible
    else false
  end as birth_year_visible,
  is_living,
  is_placeholder,
  privacy_level,
  archived_at,
  updated_at,
  anonymized_at
from public.people;
