import type { drizzle } from 'drizzle-orm/node-postgres'

type DrizzleClient = ReturnType<typeof drizzle>
export type DrizzleTransaction = Parameters<Parameters<DrizzleClient['transaction']>[0]>[0]
