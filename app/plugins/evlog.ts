import { initLog } from "evlog/client";

export default defineNuxtPlugin(() => {
	initLog({
		service: "shinro-client",
		enabled: true,
		console: true,
		pretty: true,
	});
});
