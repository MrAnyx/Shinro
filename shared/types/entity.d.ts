import type { User } from "~~/prisma/generated/client";

export type UserInfo = Pick<User, "id" | "username" | "role" | "createdAt" | "updatedAt">;
