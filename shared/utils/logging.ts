import { createConsola } from "consola";

export const useLogger = (tag?: string) =>
	createConsola({
		defaults: {
			tag,
		},
		level: 999,
		fancy: false, // important to prevent trace errors
	});
