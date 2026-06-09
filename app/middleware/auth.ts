import { isTRPCClientError } from "@trpc/client";

export default defineNuxtRouteMiddleware(async () => {
	const authStore = useAuthStore();

	if (authStore.isAuthenticated) {
		return;
	}

	try {
		await authStore.fetchMe();
	} catch (err: any) {
		if (isTRPCClientError(err) && err.data?.code === "UNAUTHORIZED") {
			return navigateTo("/auth/login");
		}
	}
});
