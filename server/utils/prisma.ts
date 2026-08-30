import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, Prisma } from "#prisma/client";

export function buildPrismaOrderBy<TOrderBy>(input: { sort: string; order: Prisma.SortOrder }[]): TOrderBy[] {
	return input.map(({ sort, order }) =>
		sort
			.split(".")
			.reduceRight<Record<string, unknown>>(
				(acc, key) => ({ [key]: acc }),
				order as unknown as Record<string, unknown>,
			),
	) as TOrderBy[];
}

const prismaClientSingleton = () => {
	const pool = new PrismaPg({
		connectionString: serverEnv.DATABASE_URL,
	});
	return new PrismaClient({
		adapter: pool,
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
