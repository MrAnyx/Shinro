export const useSafeAsyncData = <T>(
	fetcher: () => Promise<T>,
	options?: Parameters<typeof useAsyncData<T>>[2] & {
		key?: string;
		onError?: (err: unknown) => void;
	},
) => {
	const toast = useStatusToast();
	const { onError = (err: unknown) => toast.error(err), ...asyncDataOptions } = options ?? {};

	return useAsyncData<T>(async () => {
		try {
			return await fetcher();
		} catch (err) {
			onError?.(err);
			throw err;
		}
	}, asyncDataOptions);
};
