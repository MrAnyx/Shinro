export default defineNitroPlugin((nitroApp) => {
	const log = useLogger();

	nitroApp.hooks.hook("request", (event) => {
		event.context.startTime = new Date();
	});

	nitroApp.hooks.hook("afterResponse", (event) => {
		const duration = Date.now() - event.context.startTime;
		log.info(`[${event.method} - ${duration}ms] ${event.path}`);
	});
});
