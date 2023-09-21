import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { UsersSchema } from "./users/schema";

const connectionString =
  process.env.NODE_ENV !== "production"
    ? "postgres://postgres@localhost/app"
    : `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

const sql = postgres(connectionString);
export const db = drizzle(sql, { schema: { users: UsersSchema.table } });
