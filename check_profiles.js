const pg = require("pg");
const { Pool } = pg;
const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_LBgJ9Gmrb7zs@ep-noisy-scene-aplf8v8s-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require", ssl: { rejectUnauthorized: false } });
async function main() {
  const { rows } = await pool.query("SELECT id, user_id, username FROM profiles");
  console.log(rows);
  process.exit(0);
}
main().catch(console.error);
