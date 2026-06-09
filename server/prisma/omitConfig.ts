import { PrismaClient } from "#server/prisma/generated/client";

type ClientOptions = NonNullable<ConstructorParameters<typeof PrismaClient>[0]>;

export const omitConfig = {} satisfies ClientOptions["omit"];
