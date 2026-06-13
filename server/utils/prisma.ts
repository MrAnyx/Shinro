import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "#server/prisma/generated/client";
import { omitConfig } from "#server/prisma/omitConfig";

const prismaClientSingleton = () => {
	const pool = new PrismaPg({
		connectionString: serverEnv.DATABASE_URL,
	});
	return new PrismaClient({
		adapter: pool,
		omit: omitConfig,
	});
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (serverEnv.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
