export default defineNuxtRouteMiddleware(() => {
	const config = useClientConfig();

	if (!config.enableBooks) {
		return abortNavigation({
			statusCode: 404,
			statusMessage: "Not Found",
			statusText: "The page you are looking for does not exist",
		});
	}
});
