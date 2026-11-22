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

// Prisma does not export its error codes: https://www.prisma.io/docs/orm/reference/error-reference
export const PrismaErrorCode = {
	ValueTooLong: "P2000",
	RecordNotFoundInWhere: "P2001",
	UniqueConstraintFailed: "P2002",
	ForeignKeyConstraintFailed: "P2003",
	ConstraintFailed: "P2004",
	NullConstraintViolation: "P2011",
	RequiredRelationViolation: "P2014",
	RelatedRecordNotFound: "P2015",
	RequiredConnectedRecordsNotFound: "P2018",
	TableDoesNotExist: "P2021",
	ColumnDoesNotExist: "P2022",
	ConnectionPoolTimeout: "P2024",
	RecordNotFound: "P2025",
	TransactionConflict: "P2034",
} as const;

export type PrismaErrorCode = (typeof PrismaErrorCode)[keyof typeof PrismaErrorCode];

export function isPrismaError(error: unknown, code: PrismaErrorCode): error is Prisma.PrismaClientKnownRequestError {
	return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

const prismaClientSingleton = () => {
	const pool = new PrismaPg({
		connectionString: serverEnv.DATABASE_URL,
	});
	return new PrismaClient({
		adapter: pool,
	});
};

export interface DbOptions {
	/** Client to run the query with, such as a transaction client. Defaults to the Prisma singleton. */
	db?: Prisma.TransactionClient;
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (serverEnv.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
