import { initTRPC } from "@trpc/server";
import type { H3Event } from "h3";

export const createContext = async (_event: H3Event) => ({
	// Add auth, user, db, etc. here
});

type Context = Awaited<ReturnType<typeof createContext>>;

const trpc = initTRPC.context<Context>().create();

export const router = trpc.router;
export const publicProcedure = trpc.procedure;
