import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import cookie from "cookie";
import z from "zod";
import { router, publicProcedure } from "~~/server/trpc/init";

export const usersRouter = router({
	register: publicProcedure
		.input(
			z.object({
				username: usernameRule,
				password: passwordRule,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userExist = await prisma.user.findFirst({
				where: {
					username: input.username,
				},
				select: {
					id: true,
				},
			});

			if (userExist) {
				throw new TRPCError({
					code: "CONFLICT",
					cause: "Username already used",
					message: "Choose a different username to create a new user",
				});
			}

			const password = await bcrypt.hash(input.password, 10);

			const user = await prisma.user.create({
				data: {
					password: password,
					username: input.username,
				},
				select: {
					id: true,
					username: true,
				},
			});

			const tokenDuration = 10 * 60; // 10 minutes

			const jwtToken = await signJwt(
				{
					id: user.id,
					username: user.username,
				},
				tokenDuration,
			);

			const serializedCookie = cookie.serialize("auth_token", jwtToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: tokenDuration,
				path: "/",
			});

			ctx.event.node.res.appendHeader("Set-Cookie", serializedCookie);

			return {
				id: user.id,
				username: user.username,
			};
		}),

	login: publicProcedure
		.input(
			z.object({
				username: usernameRule,
				password: passwordRule,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const user = await prisma.user.findFirst({
				where: {
					username: input.username,
				},
			});

			if (!user) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: "Unknown username",
					message: "User doesn't exist",
				});
			}

			const isPasswordValid = await bcrypt.compare(
				input.password,
				user.password,
			);

			if (!isPasswordValid) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: "Invalid password",
					message: "Invalid password",
				});
			}

			const tokenDuration = 10 * 60; // 10 minutes

			const jwtToken = await signJwt(
				{
					id: user.id,
					username: user.username,
				},
				tokenDuration,
			);

			const serializedCookie = cookie.serialize("auth_token", jwtToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: tokenDuration,
				path: "/",
			});

			ctx.event.node.res.appendHeader("Set-Cookie", serializedCookie);

			return {
				id: user.id,
				username: user.username,
			};
		}),
});
