import { Role } from "#server/prisma/generated/enums";

export interface JwtClaims {
	id: string;
	username: string;
	role: Role;
}
