import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

export async function up(connectionString: string) {
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);
  // Il path e' corretto, ma vedremo dopo perche'
  await migrate(db, { migrationsFolder: "./drizzle" });
  await sql.end();
}
