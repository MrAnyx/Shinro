export default defineNuxtRouteMiddleware((to) => {
	const toast = useStatusToast();
	const config = useClientConfig();

	if (!config.allowRegistration && to.path === "/auth/register") {
		toast.warning({
			title: "Registration not allowed",
			description: "Registration as been disabled by the administrator",
		});

		return navigateTo("/");
	}
});
