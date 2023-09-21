export * as UsersSchema from "./schema";

import { timestamp, varchar, pgTable, bigserial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

export const table = pgTable("users", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  password: varchar("password"),
  role: varchar("role", { enum: ["admin", "customer"] }).notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insert = createInsertSchema(table);
export const select = createSelectSchema(table);

export type Select = typeof table.$inferSelect;
export type Insert = typeof table.$inferInsert;
