export default defineNuxtRouteMiddleware((to) => {
	if (!clientEnv.allowRegistration && to.path === "/auth/register") {
		throw createError({
			statusCode: 403,
			statusMessage: "Regitration is not allowed",
			cause: "Registration as been disabled",
		});
	}
});
