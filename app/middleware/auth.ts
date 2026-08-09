export default defineNuxtRouteMiddleware(async () => {
	const userStore = useUserStore();
	const toast = useToast();

	if (userStore.isAuthenticated) {
		return;
	}

	try {
		await userStore.fetchMe();
	} catch (err: any) {
		const code = getTRPCErrorCode(err);

		if (code === "UNAUTHORIZED") {
			toast.add({
				title: "Almost there!",
				description: "Log in to unlock the full application",
				color: "warning",
				type: "foreground",
			});
			return navigateTo("/auth/login");
		} else {
			toast.add({
				title: "Oops!",
				description: "Something went wrong during login. Please retry.",
				color: "error",
				type: "foreground",
			});

			return navigateTo("/");
		}
	}
});
