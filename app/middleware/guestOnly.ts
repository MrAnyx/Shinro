export default defineNuxtRouteMiddleware(() => {
	const { isAuthenticated } = useUserStore();
	const toast = useStatusToast();

	if (isAuthenticated) {
		toast.warning({
			title: "Can not access this page",
			description: "You must be unauthenticated to access this page",
		});

		return navigateTo("/");
	}
});
