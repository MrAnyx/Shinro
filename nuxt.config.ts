import "./server/utils/serverEnv";

export default defineNuxtConfig({
	build: {
		transpile: ["@trpc/client"],
	},
	vite: {
		optimizeDeps: {
			include: ["@unovis/ts", "@unovis/vue", "@vueuse/core", "zod", "superjson"],
		},
	},
	runtimeConfig: {
		public: {
			allowRegistration: true,
		},
	},
	telemetry: false,
	colorMode: {
		fallback: "dark",
		preference: "dark",
	},
	compatibilityDate: "2025-07-15",
	css: ["~/assets/css/main.css"],
	devtools: { enabled: true },
	modules: ["@nuxt/ui", "@pinia/nuxt"],
	ssr: false,
	typescript: {
		strict: true,
		typeCheck: true,
	},
});
