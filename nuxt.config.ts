// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	build: {
		transpile: ["@trpc/client"],
	},
	colorMode: {
		fallback: "dark",
		preference: "dark",
	},
	compatibilityDate: "2025-07-15",
	css: ["~/assets/css/main.css"],
	devtools: { enabled: false },
	modules: ["@nuxt/ui"],
	ssr: false,
	typescript: {
		strict: true,
		typeCheck: true,
	},
});
