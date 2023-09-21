import type { Config } from "drizzle-kit";

export default {
  schema: "./src/**/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: "postgres://postgres@localhost/app",
  },
} satisfies Config;
