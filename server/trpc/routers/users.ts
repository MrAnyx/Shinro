import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
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
		.mutation(async ({ input }) => {
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

			return await prisma.user.create({
				data: {
					password: password,
					username: input.username,
				},
				select: {
					id: true,
					username: true,
					createdAt: true,
					updatedAt: true,
				},
			});
		}),
});
