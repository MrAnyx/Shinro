declare module "nuxt/schema" {
	interface RuntimeConfig {
		jwtSecret: string;
		databaseUrl: string;
	}
	interface PublicRuntimeConfig {
		allowRegistration: boolean;
	}
}

export {};
