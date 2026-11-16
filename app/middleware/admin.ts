export default defineNuxtRouteMiddleware(() => {
	const userStore = useUserStore();
	const toast = useStatusToast();

	if (!userStore.isAdmin) {
		toast.warning({ description: "Administrator access is required for this page" });

		return navigateTo("/app");
	}
});
