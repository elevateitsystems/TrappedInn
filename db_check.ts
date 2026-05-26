import { db, profilesTable } from "./lib/db/src/index";
async function check() {
  const profiles = await db.query.profilesTable.findMany();
  console.log(profiles);
  process.exit(0);
}
check();
