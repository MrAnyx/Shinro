export const useClientConfig = () => clientEnvSchema.parse(useRuntimeConfig().public);
