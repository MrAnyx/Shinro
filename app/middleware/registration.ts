export default defineNuxtRouteMiddleware((to) => {
	const {
		public: { allowRegistration },
	} = useRuntimeConfig();

	if (!allowRegistration && to.path === "/auth/register") {
		throw createError({
			statusCode: 404,
			statusMessage: "Regitration is not allowed",
		});
	}
});
