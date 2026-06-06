import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "~~/env";
import { PrismaClient } from "~~/prisma/generated/client";

const prismaClientSingleton = () => {
	const pool = new PrismaPg({
		connectionString: env.DATABASE_URL,
	});
	return new PrismaClient({ adapter: pool });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
