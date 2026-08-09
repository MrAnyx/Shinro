export default defineNuxtRouteMiddleware(() => {
	const { isAuthenticated } = useUserStore();
	const toast = useToast();

	if (isAuthenticated) {
		toast.add({
			title: "Can not access this page",
			description: "You must be unauthenticated to access this page",
			color: "warning",
			type: "foreground",
		});

		return navigateTo("/");
	}
});
