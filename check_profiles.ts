import { db } from "../src/db/index.js";
import { profilesTable } from "../src/db/schema/profiles.js";

async function main() {
  const profiles = await db.query.profilesTable.findMany();
  console.log("PROFILES:", profiles.map(p => ({ id: p.id, username: p.username, userId: p.userId })));
  process.exit(0);
}
main().catch(console.error);
