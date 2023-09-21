export * as UsersModel from "./model";

import { db } from "../client";
import { table, Insert } from "./schema";

export async function list() {
  return await db.query.users.findMany({});
}

export async function create(user: Insert) {
  const result = await db.insert(table).values(user).returning();
  return result.at(0);
}
