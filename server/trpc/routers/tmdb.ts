import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { addSeconds } from "date-fns";
import z from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

export const tmdbRouter = router({
	movies: protectedProcedure
		.input(z.void())
		.output(z.void())
		.query(async ({ input, ctx }) => {
			const tmp = await tmdb("/movie/11");
			console.log(tmp);
		}),
});
