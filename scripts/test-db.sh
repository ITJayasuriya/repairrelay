#!/bin/sh
set -eu
# Fixed local container only: no URL, hosted link, reset or credential input.
container=supabase_db_repairrelay
docker exec "$container" pg_isready -U postgres -d postgres >/dev/null
for test_file in supabase/tests/*.sql; do
  docker exec -i "$container" psql -X -U postgres -d postgres -v ON_ERROR_STOP=1 < "$test_file"
done
node scripts/test-membership-race.mjs
