declare module "nuxt/schema" {
	interface RuntimeConfig {
		jwtSecret: string;
	}
	// oxlint-disable-next-line typescript/no-empty-interface
	interface PublicRuntimeConfig {}
}
// It is always important to ensure you import/export something when augmenting a type
export {};
