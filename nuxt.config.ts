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
	image: {
		providers: {
			tmdb: {
				provider: "~/lib/providers/tmdb.ts",
				options: {
					baseURL: "https://image.tmdb.org/t/p",
					imageSize: "w500",
				},
			},
		},
	},
	modules: ["@nuxt/ui", "@pinia/nuxt", "@nuxt/image"],
	ssr: false,
	typescript: {
		strict: true,
		typeCheck: true,
	},
});
