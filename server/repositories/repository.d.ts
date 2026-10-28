import type { Prisma } from "#prisma/client";

/** Either the global prisma client or a transaction client, so repositories work inside `$transaction`. */
export type DbClient = Prisma.TransactionClient;
