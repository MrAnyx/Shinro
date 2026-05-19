// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	build: {
		transpile: ["trpc-nuxt"],
	},
	colorMode: {
		fallback: "dark",
		preference: "dark",
	},
	compatibilityDate: "2025-07-15",
	css: ["~/assets/css/main.css"],
	devtools: { enabled: false },
	evlog: {
		env: {
			service: "shinro",
		},
		minLevel: "info",
		// Optional: only log specific routes (supports glob patterns)
		// Include: ["/api/**"],
	},
	modules: ["@nuxt/ui", "evlog/nuxt"],
	ssr: false,
	typescript: {
		strict: true,
		typeCheck: true,
	},
	ui: {},
});
