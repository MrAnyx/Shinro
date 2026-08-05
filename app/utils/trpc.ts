import { TRPCClientError } from "@trpc/client";
import type { AnyProcedure, inferProcedureInput, inferProcedureOutput } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import type { AppRouter } from "~~/server/trpc/router";

export type TRPCProcedureInput<
	TRouter extends keyof AppRouter,
	TProcedure extends keyof AppRouter[TRouter],
> = AppRouter[TRouter][TProcedure] extends AnyProcedure ? inferProcedureInput<AppRouter[TRouter][TProcedure]> : never;

export type TRPCProcedureOutput<
	TRouter extends keyof AppRouter,
	TProcedure extends keyof AppRouter[TRouter],
> = AppRouter[TRouter][TProcedure] extends AnyProcedure ? inferProcedureOutput<AppRouter[TRouter][TProcedure]> : never;

export const isTRPCError = (err: unknown): err is TRPCClientError<AppRouter> => {
	return err instanceof TRPCClientError;
};

export const getTRPCErrorCode = (err: unknown): TRPC_ERROR_CODE_KEY | undefined => {
	if (isTRPCError(err)) {
		return err.data?.code ?? undefined;
	}
	return undefined;
};
