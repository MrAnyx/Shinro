import { env } from "~~/env";

export default defineNuxtRouteMiddleware((to) => {
	if (!env.NUXT_PUBLIC_ALLOW_REGISTRATION && to.path === "/auth/register") {
		throw createError({
			statusCode: 403,
			statusMessage: "Regitration is not allowed",
		});
	}
});
