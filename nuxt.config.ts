// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	build: {
		transpile: ["@trpc/client"],
	},
	vite: {
		optimizeDeps: {
			include: ["@unovis/ts", "@unovis/vue"],
		},
	},
	colorMode: {
		fallback: "dark",
		preference: "dark",
	},
	runtimeConfig: {
		// Types must be defined in the shared/types/runtimeConfig.d.ts file as well
		// It must also be validated in the server/plugin/runtimeConfig.ts file
		jwtSecret: undefined,
		databaseUrl: undefined,
		public: {
			allowRegistration: undefined,
		},
	},
	compatibilityDate: "2025-07-15",
	css: ["~/assets/css/main.css"],
	devtools: { enabled: true },
	modules: ["@nuxt/ui"],
	ssr: false,
	typescript: {
		strict: true,
		typeCheck: true,
	},
});
