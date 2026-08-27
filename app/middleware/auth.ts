export default defineNuxtRouteMiddleware(async () => {
	const userStore = useUserStore();
	const toast = useStatusToast();

	if (userStore.isAuthenticated) {
		return;
	}

	try {
		await userStore.fetchMe();
	} catch (err: any) {
		const code = getTRPCErrorCode(err);

		if (code === "UNAUTHORIZED") {
			toast.warning({
				title: "Almost there!",
				description: "Log in to unlock the full application",
			});
			return navigateTo("/auth/login");
		} else {
			toast.error(null, {
				title: "Oops!",
				description: "Something went wrong during login. Please retry.",
			});

			return navigateTo("/");
		}
	}
});
