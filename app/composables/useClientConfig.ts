export const useClientConfig = () => {
	const runtimeConfig = useRuntimeConfig();
	return clientEnvSchema.parse(runtimeConfig.public);
};
