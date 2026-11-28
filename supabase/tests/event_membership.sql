begin;
-- Synthetic identities exist only in this rolled-back transaction.
insert into auth.users(id) values
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000004');
create function pg_temp.check_that(ok boolean, label text) returns void
language plpgsql as $$ begin
  if ok is distinct from true then raise exception 'FAIL: %', label; end if;
  raise notice 'PASS: %', label;
end $$;
create function pg_temp.rejects(query text, expected text) returns void
language plpgsql as $$ begin
  begin
    execute query;
  exception when others then
    if sqlstate = expected then raise notice 'PASS: rejected with %', expected; return; end if;
    raise;
  end;
  raise exception 'FAIL: expected SQLSTATE % for %', expected, query;
end $$;

set local role anon;
select pg_temp.rejects($q$select * from public.events$q$, '42501');
select pg_temp.rejects($q$select public.create_event(gen_random_uuid(), 'Bench', current_date, 'UTC')$q$, '42501');
reset role;
set local role authenticated;
select pg_temp.rejects($q$select public.create_event(gen_random_uuid(), 'Bench', current_date, 'UTC')$q$, '42501');
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.create_event('20000000-0000-0000-0000-000000000001', 'Bench A', '2026-11-29', 'Asia/Colombo');
select public.create_event('20000000-0000-0000-0000-000000000001', 'Bench A', '2026-11-29', 'Asia/Colombo');
select pg_temp.check_that((select count(*) = 1 from public.events), 'create retry is idempotent');
select pg_temp.check_that(private.event_role('20000000-0000-0000-0000-000000000001') = 'owner', 'owner derived from event');
select pg_temp.rejects($q$select public.create_event('20000000-0000-0000-0000-000000000001', 'changed', '2026-11-29', 'UTC')$q$, '22023');
select pg_temp.rejects($q$select public.create_event(gen_random_uuid(), ' ', current_date, 'UTC')$q$, '22023');
select pg_temp.rejects($q$select public.create_event(gen_random_uuid(), 'Bench', current_date, 'Invalid/Zone')$q$, '22023');
select pg_temp.rejects($q$insert into public.events(id, owner_id, title, event_date, timezone) values(gen_random_uuid(), auth.uid(), 'Bypass', current_date, 'UTC')$q$, '42501');
select pg_temp.rejects($q$update public.events set status='closed'$q$, '42501');
select pg_temp.rejects($q$delete from public.events$q$, '42501');
select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 0, 'coordinator');
select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 1, 'repairer');
select pg_temp.rejects($q$select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, 'repairer')$q$, '22023');
select pg_temp.rejects($q$select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 2, 'owner')$q$, '22023');
select pg_temp.rejects($q$select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000099', 2, 'repairer')$q$, '23503');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000004', true);
select public.create_event('20000000-0000-0000-0000-000000000002', 'Bench B', '2026-11-29', 'UTC');
select pg_temp.check_that((select count(*) = 1 from public.events), 'unrelated owner cannot read event A');
select pg_temp.check_that((select count(*) = 0 from public.event_members), 'unrelated owner cannot read membership A');
select pg_temp.rejects($q$select public.create_event('20000000-0000-0000-0000-000000000001', 'Bench A', '2026-11-29', 'Asia/Colombo')$q$, '22023');
select pg_temp.rejects($q$select public.set_event_member('20000000-0000-0000-0000-000000000001', auth.uid(), 0, 'coordinator')$q$, '42501');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select pg_temp.check_that((select count(*) = 1 from public.events), 'coordinator sees only joined event');
select pg_temp.check_that((select count(*) = 2 from public.event_members), 'coordinator reads event roster without RLS recursion');
select pg_temp.rejects($q$select public.set_event_member('20000000-0000-0000-0000-000000000001', auth.uid(), 2, 'repairer')$q$, '42501');
select pg_temp.rejects($q$update public.event_members set role='coordinator'$q$, '42501');
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select pg_temp.check_that(private.event_role('20000000-0000-0000-0000-000000000001') = 'repairer', 'repairer role comes from database');
select pg_temp.rejects($q$select public.set_event_member('20000000-0000-0000-0000-000000000001', auth.uid(), 2, 'coordinator')$q$, '42501');

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 2, 'coordinator');
select pg_temp.rejects($q$select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 1, 'repairer')$q$, '40001');
select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 3, null);
select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 3, null);
-- Remove/re-add returns to the same role but must still reject an old version.
select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 4, 'repairer');
select pg_temp.rejects($q$select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 2, 'coordinator')$q$, '40001');
select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 5, null);
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select pg_temp.check_that((select count(*) = 0 from public.events), 'revoked user loses event read immediately');
select pg_temp.check_that((select count(*) = 0 from public.event_members), 'revoked user loses roster read immediately');

reset role;
update public.events set status='closed' where id='20000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select pg_temp.rejects($q$select public.set_event_member('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 3, null)$q$, '55000');
select pg_temp.check_that((select count(*) = 1 from public.event_members), 'closed event preserves membership');
rollback;
