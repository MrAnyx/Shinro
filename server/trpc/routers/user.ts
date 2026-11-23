import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { Prisma } from "#prisma/client";
import { Role } from "#prisma/enums";
import { router, publicProcedure, protectedProcedure, rateLimitMiddleware } from "#server/trpc/init";

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
		.use(rateLimitMiddleware({ name: "register", ...AUTH_RATE_LIMITS.register }))
		.output(UserSchema)
		.mutation(async ({ input, ctx }) => {
			if (!serverEnv.NUXT_PUBLIC_ALLOW_REGISTRATION) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Registration is disabled on this instance",
				});
			}

			const passwordHash = await bcrypt.hash(input.password, 10);

			try {
				const { user, sessionToken } = await prisma.$transaction(async (tx) => {
					// Registration never grants ADMIN; the first admin is claimed with the one-time setup token (see claimAdmin)
					const newUser = await tx.user.create({
						data: {
							passwordHash,
							username: input.username,
							role: Role.USER,
						},
					});

					const sessionToken = await createSession(newUser.id, { db: tx });

					return { user: newUser, sessionToken };
				});

				setSessionCookie(ctx.event, sessionToken);

				return user;
			} catch (error) {
				if (isPrismaError(error, PrismaErrorCode.UniqueConstraintFailed)) {
					throw new TRPCError({
						code: "CONFLICT",
						message: ERROR_MESSAGES.CONFLICT,
					});
				}
				throw error;
			}
		}),

	login: publicProcedure
		.input(
			z.object({
				username: ServerUserValidation.username,
				password: ServerUserValidation.password,
			}),
		)
		.use(rateLimitMiddleware({ name: "login:ip", ...AUTH_RATE_LIMITS.loginIp }))
		.use(
			rateLimitMiddleware<{ username: string }>({
				name: "login",
				...AUTH_RATE_LIMITS.login,
				key: ({ input }) => input.username.toLowerCase(),
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

				const sessionToken = await createSession(user.id, { db: tx });

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

	logoutOthers: protectedProcedure
		.input(z.void())
		.output(z.object({ count: z.number().int().nonnegative() }))
		.mutation(async ({ ctx }) => {
			const { count } = await prisma.session.deleteMany({
				where: {
					userId: ctx.user.id,
					id: { not: ctx.sessionId },
				},
			});

			return { count };
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
					message: ERROR_MESSAGES.NOT_FOUND,
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
					currentPassword: ServerUserValidation.password.optional(),
				})
				.refine((input) => input.username !== undefined || input.password !== undefined, {
					message: "At least one profile field must be provided",
				})
				.refine((input) => input.password === undefined || input.currentPassword !== undefined, {
					message: "Current password is required to change the password",
					path: ["currentPassword"],
				}),
		)
		.output(UserSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				return await prisma.$transaction(async (tx) => {
					const user = await tx.user.findUnique({
						where: {
							id: ctx.user.id,
						},
						select: {
							id: true,
							username: true,
							passwordHash: true,
						},
					});

					if (!user) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: ERROR_MESSAGES.NOT_FOUND,
						});
					}

					if (
						input.password !== undefined &&
						!(await bcrypt.compare(input.currentPassword ?? "", user.passwordHash))
					) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "Current password is incorrect",
						});
					}

					const password = input.password ? await bcrypt.hash(input.password, 10) : undefined;

					// Changing a credential (username or password) revokes every other session of the user
					const isUsernameChanged = input.username !== undefined && input.username !== user.username;

					if (password || isUsernameChanged) {
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
			} catch (error) {
				if (isPrismaError(error, PrismaErrorCode.UniqueConstraintFailed)) {
					throw new TRPCError({
						code: "CONFLICT",
						message: ERROR_MESSAGES.CONFLICT,
					});
				}
				throw error;
			}
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
		.use(
			rateLimitMiddleware({
				name: "verify-password",
				...AUTH_RATE_LIMITS.verifyPassword,
				key: ({ ctx }) => getSessionCookie(ctx.event),
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
					message: ERROR_MESSAGES.NOT_FOUND,
				});
			}

			return await bcrypt.compare(input.password, user.passwordHash);
		}),

	adminSetupStatus: protectedProcedure
		.input(z.void())
		.output(z.object({ pending: z.boolean() }))
		.query(async () => {
			return { pending: await isAdminSetupPending() };
		}),

	/**
	 * Promote the current user to ADMIN with the one-time setup token printed in the server logs at boot
	 * while the instance has no administrator.
	 */
	claimAdmin: protectedProcedure
		.input(
			z.object({
				token: ServerUserValidation.adminSetupToken,
			}),
		)
		.output(UserSchema)
		.mutation(async ({ ctx, input }) => {
			if (!(await verifyAdminSetupToken(input.token))) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid or expired setup token",
				});
			}

			const user = await prisma.$transaction(async (tx) => {
				// Serialize concurrent claims so only one account can become the first administrator
				await tx.$executeRaw`SELECT pg_advisory_xact_lock(${ADMIN_SETUP_LOCK_KEY}::bigint)`;

				if (await hasAdminUser({ db: tx })) {
					return null;
				}

				return await tx.user.update({
					where: {
						id: ctx.user.id,
					},
					data: {
						role: Role.ADMIN,
					},
				});
			});

			await deleteAdminSetupToken();

			if (!user) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "This instance already has an administrator",
				});
			}

			return user;
		}),
});
