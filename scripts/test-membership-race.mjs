import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";

const args = [
  "exec",
  "-i",
  "supabase_db_repairrelay",
  "psql",
  "-X",
  "-qAt",
  "-U",
  "postgres",
  "-d",
  "postgres",
  "-v",
  "ON_ERROR_STOP=1",
];
function sql(query) {
  const result = spawnSync("docker", args, { input: query, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
function concurrent(query) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args);
    let output = "";
    child.stderr.on("data", (data) => {
      output += data;
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, output }));
    child.stdin.end(query);
  });
}
const owner = "30000000-0000-0000-0000-000000000001";
const member = "30000000-0000-0000-0000-000000000002";
const event = "40000000-0000-0000-0000-000000000001";
try {
  sql(`begin;
    insert into auth.users(id) values ('${owner}'), ('${member}');
    insert into public.events(id, owner_id, title, event_date, timezone)
      values ('${event}', '${owner}', 'Synthetic membership race', current_date, 'UTC');
    commit;`);
  const command = (role) => `begin;
    set local role authenticated;
    select set_config('request.jwt.claim.sub', '${owner}', true);
    select public.set_event_member('${event}', '${member}', 0, '${role}');
    select pg_sleep(0.15);
    commit;`;
  const results = await Promise.all([
    concurrent(command("coordinator")),
    concurrent(command("repairer")),
  ]);
  assert.equal(results.filter(({ code }) => code === 0).length, 1);
  assert.match(
    results.find(({ code }) => code !== 0).output,
    /membership_conflict/,
  );
  assert.equal(
    sql(`select membership_version from public.events where id='${event}'`),
    "1",
  );
  assert.equal(
    sql(`select count(*) from public.event_members where event_id='${event}'`),
    "1",
  );
  console.log(
    "PASS: concurrent membership changes serialize; exactly one succeeds",
  );
} finally {
  sql(`begin;
    delete from public.event_members where event_id='${event}';
    delete from public.events where id='${event}';
    delete from auth.users where id in ('${owner}', '${member}');
    commit;`);
}
