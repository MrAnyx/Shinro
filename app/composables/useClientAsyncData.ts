type Options<T> = Omit<NonNullable<Parameters<typeof useAsyncData<T>>[2]>, "lazy" | "server"> & {
	key?: string;
	onError?: (err: unknown) => boolean;
	defaultErrorMessage?: string;
};

export const useClientAsyncData = <T>(fetcher: () => Promise<T>, options?: Options<T>) => {
	const toast = useStatusToast();
	const { key, onError, defaultErrorMessage, ...asyncDataOptions } = options ?? {};
	const resolvedKey = key ?? useId();

	const result = useAsyncData<T>(resolvedKey, () => fetcher(), {
		...asyncDataOptions,
		lazy: true,
		server: false,
	});

	watch(result.error, (err) => {
		if (!err) {
			return;
		}

		// false → suppress
		if (onError?.(err) === false) {
			return;
		}

		toast.error(err, defaultErrorMessage ? { description: defaultErrorMessage } : {});
	});

	return result;
};
