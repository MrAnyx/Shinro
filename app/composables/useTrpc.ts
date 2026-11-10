export const useTrpc = () => {
	const nuxtApp = useNuxtApp();
	return nuxtApp.$trpc;
};
