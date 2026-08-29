export const useSafeAsyncData = <T>(
	fetcher: () => Promise<T>,
	options?: Parameters<typeof useAsyncData<T>>[2] & {
		key?: string;
		onError?: (err: unknown) => boolean;
		defaultErrorMessage?: string;
	},
) => {
	const toast = useStatusToast();
	const { key, onError, defaultErrorMessage, ...asyncDataOptions } = options ?? {};
	const resolvedkey = key ?? uuid();

	return useAsyncData<T>(
		resolvedkey,
		async () => {
			try {
				return await fetcher();
			} catch (err) {
				if (onError?.(err) === false) {
					return undefined as T; // false → suppress
				}
				// true / no onError → default toast
				toast.error(err, defaultErrorMessage ? { description: defaultErrorMessage } : {});
				throw err;
			}
		},
		asyncDataOptions,
	);
};
