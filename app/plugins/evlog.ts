import { initLog } from "evlog/client";

export default defineNuxtPlugin(() => {
	initLog({
		service: "shinro-client",
	});
});
