import { isTRPCClientError } from "@trpc/client";
import { getHTTPStatusCode, getHTTPStatusCodeFromError } from "@trpc/server/unstable-core-do-not-import";

export default defineNuxtRouteMiddleware(async () => {
	const authStore = useAuthStore();
	const toast = useToast();

	if (authStore.isAuthenticated) {
		return;
	}

	try {
		await authStore.fetchMe();
	} catch (err: any) {
		const code = getTRPCErrorCode(err);

		if (code === "UNAUTHORIZED") {
			toast.add({
				title: "Almost there!",
				description: "Log in to unlock the full application",
				color: "warning",
			});
			return navigateTo("/auth/login");
		} else {
			toast.add({
				title: "Oops!",
				description: "Something went wrong during login. Please retry.",
				color: "error",
			});

			return navigateTo("/");
		}
	}
});
