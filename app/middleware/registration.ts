export default defineNuxtRouteMiddleware((to) => {
	const toast = useToast();

	if (!clientEnv.allowRegistration && to.path === "/auth/register") {
		toast.add({
			title: "Registration not allowed",
			description: "Registration as been disabled by the administrator",
			color: "warning",
			type: "foreground",
		});

		return navigateTo("/");
	}
});
