import { TRPCClientError } from "@trpc/client";

export const useInitialization = () => {
	const isLoading = useState("app:loading", () => false);
	const isReady = useState("app:ready", () => false);

	const trpc = useTrpc();

	const initialize = async () => {
		if (isReady.value) {
			return;
		}

		try {
			isLoading.value = true;
			await trpc.users.me.query();
			isReady.value = true;
		} catch (err: any) {
			if (
				err instanceof TRPCClientError &&
				err.data?.code === "UNAUTHORIZED"
			) {
				await navigateTo("/auth/login");
			}
		} finally {
			isLoading.value = false;
		}
	};

	return { isLoading, isReady, initialize };
};
