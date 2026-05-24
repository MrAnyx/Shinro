export default defineNuxtRouteMiddleware(() => {
	const { isLoggedIn } = useAuthState();

	if (isLoggedIn.value) {
		return navigateTo("/");
	}
});
