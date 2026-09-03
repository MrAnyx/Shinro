type Options<T> = Omit<NonNullable<Parameters<typeof useAsyncData<T>>[2]>, "lazy" | "server"> & {
	key?: string;
	ignoreError?: (err: unknown) => boolean;
	onError?: (err: unknown) => void;
	defaultErrorMessage?: string;
};

export const useClientAsyncData = <T>(fetcher: () => Promise<T>, options?: Options<T>) => {
	const toast = useStatusToast();
	const { key, ignoreError, onError, defaultErrorMessage, ...asyncDataOptions } = options ?? {};
	const resolvedKey = key ?? useId();

	const result = useAsyncData<T>(
		resolvedKey,
		async () => {
			try {
				return await fetcher();
			} catch (err) {
				if (ignoreError?.(err)) {
					return undefined as T;
				}

				throw err;
			}
		},
		{
			...asyncDataOptions,
			lazy: true,
			server: false,
		},
	);

	watch(result.error, (err) => {
		if (!err) {
			return;
		}

		if (onError) {
			onError(err.cause);
			return;
		}

		toast.error(err, defaultErrorMessage ? { description: defaultErrorMessage } : {});
	});

	return result;
};
