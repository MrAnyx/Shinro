import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { Prisma } from "#prisma/client";
import { Role } from "#prisma/enums";
import { router, publicProcedure, protectedProcedure } from "#server/trpc/init";

// Same cost factor as real password hashes so failed lookups and wrong passwords take the same time
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("shinro-dummy-password", 10);

export default router({
	register: publicProcedure
		.input(
			z.object({
				username: ServerUserValidation.username,
				password: ServerUserValidation.password,
			}),
		)
		.output(UserSchema)
		.mutation(async ({ input, ctx }) => {
			if (!serverEnv.NUXT_PUBLIC_ALLOW_REGISTRATION) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Registration is disabled on this instance",
				});
			}

			const { user, sessionToken } = await prisma.$transaction(async (tx) => {
				const [totalUsers, userExist] = await Promise.all([
					tx.user.count({ take: 1 }),
					tx.user.findUnique({
						where: { username: input.username },
						select: { id: true },
					}),
				]);

				if (userExist) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Choose a different username to create your account",
					});
				}

				const isFirstUser = totalUsers === 0;
				const passwordHash = await bcrypt.hash(input.password, 10);

				const newUser = await tx.user.create({
					data: {
						passwordHash,
						username: input.username,
						role: isFirstUser ? Role.ADMIN : Role.USER,
					},
				});

				const sessionToken = await createSession(tx, newUser.id);

				return { user: newUser, sessionToken };
			});

			setSessionCookie(ctx.event, sessionToken);

			return user;
		}),

	login: publicProcedure
		.input(
			z.object({
				username: ServerUserValidation.username,
				password: ServerUserValidation.password,
			}),
		)
		.output(UserSchema)
		.mutation(async ({ input, ctx }) => {
			const previousToken = getSessionCookie(ctx.event);

			const { user, sessionToken } = await prisma.$transaction(async (tx) => {
				const user = await tx.user.findUnique({
					where: {
						username: input.username,
					},
				});

				// Always run bcrypt so unknown usernames take as long as wrong passwords
				const isPasswordValid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

				if (!user || !isPasswordValid) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Invalid username or password",
					});
				}

				// Replace the session previously held by this browser, if any
				if (previousToken) {
					await tx.session.deleteMany({
						where: { tokenHash: hashSessionToken(previousToken) },
					});
				}

				const sessionToken = await createSession(tx, user.id);

				return { user, sessionToken };
			});

			setSessionCookie(ctx.event, sessionToken);
			return user;
		}),

	logout: protectedProcedure
		.input(z.void())
		.output(z.void())
		.mutation(async ({ ctx }) => {
			await prisma.session.deleteMany({
				where: {
					id: ctx.sessionId,
				},
			});

			deleteSessionCookie(ctx.event);
		}),

	me: protectedProcedure
		.input(z.void())
		.output(UserSchema)
		.query(async ({ ctx }) => {
			const user = await prisma.user.findUnique({
				where: {
					id: ctx.user.id,
				},
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			return user;
		}),

	updateMe: protectedProcedure
		.input(
			z
				.object({
					username: ServerUserValidation.username.optional(),
					password: ServerUserValidation.password.optional(),
				})
				.refine((input) => input.username !== undefined || input.password !== undefined, {
					message: "At least one profile field must be provided",
				}),
		)
		.output(UserSchema)
		.mutation(async ({ input, ctx }) => {
			return await prisma.$transaction(async (tx) => {
				const user = await tx.user.findUnique({
					where: {
						id: ctx.user.id,
					},
					select: {
						id: true,
					},
				});

				if (!user) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "User not found",
					});
				}

				if (input.username) {
					const usernameExist = await tx.user.findUnique({
						where: {
							username: input.username,
						},
						select: {
							id: true,
						},
					});

					if (usernameExist && usernameExist.id !== user.id) {
						throw new TRPCError({
							code: "CONFLICT",
							message: "Username already exist",
						});
					}
				}

				const password = input.password ? await bcrypt.hash(input.password, 10) : undefined;

				// Changing the password revokes every other session of the user
				if (password) {
					await tx.session.deleteMany({
						where: {
							userId: ctx.user.id,
							id: { not: ctx.sessionId },
						},
					});
				}

				return await tx.user.update({
					where: {
						id: ctx.user.id,
					},
					data: {
						username: input.username ?? Prisma.skip,
						passwordHash: password ?? Prisma.skip,
					},
				});
			});
		}),

	deleteMe: protectedProcedure
		.input(z.void())
		.output(z.void())
		.mutation(async ({ ctx }) => {
			await prisma.user.delete({
				where: {
					id: ctx.user.id,
				},
			});

			deleteSessionCookie(ctx.event);
		}),

	verifyPassword: protectedProcedure
		.input(
			z.object({
				password: ServerUserValidation.password,
			}),
		)
		.output(z.boolean())
		.mutation(async ({ ctx, input }) => {
			const user = await prisma.user.findUnique({
				where: {
					id: ctx.user.id,
				},
				select: {
					passwordHash: true,
				},
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			return await bcrypt.compare(input.password, user.passwordHash);
		}),
});
