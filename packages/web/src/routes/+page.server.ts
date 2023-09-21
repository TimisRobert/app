import { Config } from 'sst/node/config';
import type { UsersSchema } from '@app/core/users/schema';

export async function load() {
  const result = await fetch(Config.API_URL + '/users');
  const users: Promise<Array<UsersSchema.Select>> = result.json();
  return { users };
}
