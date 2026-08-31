import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
	nitro: {
		experimental: {
			tasks: true,
		},
		scheduledTasks: {
			"* * * * *": ["hello"],
		},
	},
	build: {
		transpile: ["@trpc/client"],
	},
	vite: {
		optimizeDeps: {
			include: ["@unovis/ts", "@unovis/vue", "@vueuse/core", "zod"],
		},
	},
	runtimeConfig: {
		public: {
			allowRegistration: true,
		},
	},
	icon: {
		clientBundle: {
			scan: true,
		},
	},
	telemetry: false,
	colorMode: {
		fallback: "dark",
		preference: "dark",
	},
	compatibilityDate: "2025-07-15",
	css: ["~/assets/css/main.css"],
	devtools: { enabled: false },
	image: {
		providers: {
			tmdb: {
				provider: "~/lib/providers/tmdb.ts",
				options: {
					baseURL: "https://image.tmdb.org/t/p",
					imageSize: "original",
				},
			},
		},
	},
	modules: ["@nuxt/ui", "@pinia/nuxt", "@nuxt/image", "evlog/nuxt"],
	evlog: {
		redact: true,
		enabled: true,
		console: true,
		pretty: true,
		exclude: ["/_ipx/**", "/api/**"],
		env: {
			service: "shinro-server",
		},
	},
	ssr: false,
	typescript: {
		strict: true,
		typeCheck: true,
	},
	alias: {
		"#lib": fileURLToPath(new URL("./lib", import.meta.url)),
		"#prisma": fileURLToPath(new URL("./lib/prisma", import.meta.url)),
	},
});
