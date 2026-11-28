-- Event ownership has one source of truth; members contain only delegated roles.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.events (
  id uuid primary key,
  owner_id uuid not null references auth.users(id),
  title text not null check (length(btrim(title)) between 1 and 120),
  event_date date not null,
  timezone text not null check (length(timezone) between 1 and 80),
  status text not null default 'open' check (status in ('open', 'closed')),
  membership_version bigint not null default 0 check (membership_version >= 0),
  change_seq bigint not null default 0 check (change_seq >= 0),
  next_ticket_no integer not null default 1 check (next_ticket_no > 0),
  created_at timestamptz not null default now()
);
create index events_owner on public.events(owner_id);

create table public.event_members (
  event_id uuid not null references public.events(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('coordinator', 'repairer')),
  primary key (event_id, user_id)
);
create index event_members_user on public.event_members(user_id, event_id);

-- Avoid recursive membership RLS, and never trust JWT role metadata.
create function private.event_role(p_event_id uuid) returns text
language sql stable security definer set search_path = '' as $$
  select case when e.owner_id = auth.uid() then 'owner' else m.role end
  from public.events e
  left join public.event_members m on m.event_id = e.id and m.user_id = auth.uid()
  where e.id = p_event_id;
$$;
revoke all on function private.event_role(uuid) from public, anon;
grant execute on function private.event_role(uuid) to authenticated;

alter table public.events enable row level security;
alter table public.event_members enable row level security;
revoke all on public.events, public.event_members from public, anon, authenticated;
grant select on public.events, public.event_members to authenticated;
create policy member_read_events on public.events for select to authenticated
  using (private.event_role(id) is not null);
create policy member_read_members on public.event_members for select to authenticated
  using (private.event_role(event_id) is not null);

-- Caller persists an event UUID before sending. Exact retries return the same event.
create function public.create_event(
  p_event_id uuid, p_title text, p_event_date date, p_timezone text
) returns public.events
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  result public.events;
begin
  if actor is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if p_event_id is null or p_title is null or length(btrim(p_title)) not between 1 and 120
    or p_event_date is null or p_timezone is null or length(p_timezone) > 80
    or not exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone)
  then raise exception 'invalid_event' using errcode = '22023'; end if;
  insert into public.events(id, owner_id, title, event_date, timezone)
    values (p_event_id, actor, btrim(p_title), p_event_date, p_timezone)
    on conflict (id) do nothing;
  select * into result from public.events where id = p_event_id;
  if result.owner_id <> actor or result.title <> btrim(p_title)
    or result.event_date <> p_event_date or result.timezone <> p_timezone
  then raise exception 'event_identity_reused' using errcode = '22023'; end if;
  return result;
end;
$$;

-- Membership is online-only. All future event writes must take this same lock.
-- An event-level membership version also rejects remove/re-add (ABA) races.
create function public.set_event_member(
  p_event_id uuid, p_user_id uuid, p_expected_version bigint, p_role text
) returns bigint
language plpgsql security definer set search_path = '' as $$
declare
  event public.events;
  stored_role text;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  select * into event from public.events where id = p_event_id for update;
  if not found or event.owner_id <> auth.uid()
    then raise exception 'owner_required' using errcode = '42501'; end if;
  if event.status <> 'open' then raise exception 'event_closed' using errcode = '55000'; end if;
  if p_user_id is null or p_user_id = event.owner_id
    or (p_role is not null and p_role not in ('coordinator', 'repairer'))
    or p_expected_version is null or p_expected_version < 0
    then raise exception 'invalid_member' using errcode = '22023'; end if;
  select role into stored_role from public.event_members
    where event_id = p_event_id and user_id = p_user_id;
  if stored_role is not distinct from p_role then return event.membership_version; end if;
  if event.membership_version <> p_expected_version
    then raise exception 'membership_conflict' using errcode = '40001'; end if;
  if p_role is null then
    delete from public.event_members where event_id = p_event_id and user_id = p_user_id;
  else
    insert into public.event_members(event_id, user_id, role) values (p_event_id, p_user_id, p_role)
      on conflict (event_id, user_id) do update set role = excluded.role;
  end if;
  update public.events set membership_version = membership_version + 1
    where id = p_event_id returning membership_version into event.membership_version;
  return event.membership_version;
end;
$$;
revoke all on function public.create_event(uuid, text, date, text) from public, anon;
revoke all on function public.set_event_member(uuid, uuid, bigint, text) from public, anon;
grant execute on function public.create_event(uuid, text, date, text) to authenticated;
grant execute on function public.set_event_member(uuid, uuid, bigint, text) to authenticated;
