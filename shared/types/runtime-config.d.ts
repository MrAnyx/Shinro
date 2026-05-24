// oxlint-disable typescript/no-empty-interface

declare module "nuxt/schema" {
	interface RuntimeConfig {}

	interface PublicRuntimeConfig {}
}

// It is always important to ensure you import/export something when augmenting a type
export {};
