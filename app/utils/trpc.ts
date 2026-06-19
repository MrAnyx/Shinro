import { TRPCClientError } from "@trpc/client";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import type { AppRouter } from "~~/server/trpc/router";

export const isTRPCError = (err: unknown): err is TRPCClientError<AppRouter> => {
	return err instanceof TRPCClientError;
};

export const getTRPCErrorCode = (err: unknown): TRPC_ERROR_CODE_KEY | undefined => {
	if (isTRPCError(err)) {
		return err.data?.code ?? undefined;
	}
	return undefined;
};
