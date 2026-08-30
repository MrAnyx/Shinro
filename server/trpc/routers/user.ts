import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { addSeconds } from "date-fns";
import { z } from "zod";

import { Prisma } from "#prisma/client";
import { router, publicProcedure, protectedProcedure } from "#server/trpc/init";

export default router({
	register: publicProcedure
		.input(
			z.object({
				username: ServerUserValidation.username,
				password: ServerUserValidation.password,
			}),
		)
		.output(UserDefaultViewSchema)
		.mutation(async ({ input, ctx }) => {
			// Combine count and existence check in parallel
			const [totalUsers, userExist] = await Promise.all([
				prisma.user.count({ take: 1 }),
				prisma.user.findUnique({
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
			const sessionId = generateRandomString(255);

			const user = await prisma.$transaction(async (tx) => {
				const newUser = await tx.user.create({
					data: {
						passwordHash,
						username: input.username,
						role: isFirstUser ? "ADMIN" : "USER",
					},
				});

				await tx.session.create({
					data: {
						expiresAt: addSeconds(new Date(), DEFAULT_SESSION_EXPIRATION),
						sessionId,
						userId: newUser.id,
					},
				});

				return newUser;
			});

			setCookie(ctx.event, "session_id", sessionId, {
				httpOnly: true,
				secure: serverEnv.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: DEFAULT_SESSION_EXPIRATION,
				path: "/",
			});

			return user;
		}),

	login: publicProcedure
		.input(
			z.object({
				username: ServerUserValidation.username,
				password: ServerUserValidation.password,
			}),
		)
		.output(UserDefaultViewSchema)
		.mutation(async ({ input, ctx }) => {
			const user = await prisma.user.findUnique({
				where: {
					username: input.username,
				},
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

			if (isPasswordValid) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Username or password are not valid",
				});
			}

			const sessionId = generateRandomString(255);

			await prisma.session.create({
				data: {
					expiresAt: addSeconds(new Date(), DEFAULT_SESSION_EXPIRATION),
					sessionId: sessionId,
					userId: user.id,
				},
			});

			setCookie(ctx.event, "session_id", sessionId, {
				httpOnly: true,
				secure: serverEnv.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: DEFAULT_SESSION_EXPIRATION,
				path: "/",
			});
			return user;
		}),

	logout: protectedProcedure
		.input(z.void())
		.output(z.void())
		.mutation(async ({ ctx }) => {
			await prisma.session.deleteMany({
				where: {
					sessionId: ctx.sessionId,
				},
			});

			deleteCookie(ctx.event, "session_id");
		}),

	me: protectedProcedure
		.input(z.void())
		.output(UserDefaultViewSchema)
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
		.output(UserDefaultViewSchema)
		.mutation(async ({ input, ctx }) => {
			const user = await prisma.user.findUnique({
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
				const usernameExist = await prisma.user.findUnique({
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

			return await prisma.user.update({
				where: {
					id: ctx.user.id,
				},
				data: {
					username: input.username ?? Prisma.skip,
					passwordHash: password ?? Prisma.skip,
				},
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

			deleteCookie(ctx.event, "session_id");
		}),
});
