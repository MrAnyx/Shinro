export default defineNuxtRouteMiddleware((to) => {
	if (!clientEnv.allowRegistration && to.path === "/auth/register") {
		throw createError({
			statusCode: 404,
			statusMessage: "Regitration is not allowed",
		});
	}
});
