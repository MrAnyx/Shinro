export type PendingValue<T> = {
	value: T | undefined;
};

export const usePendingValue = <T>() => {
	const pending = shallowRef<PendingValue<T>>();

	const start = (value: T | undefined) => {
		const token = { value };
		pending.value = token;
		return token;
	};

	const clear = (token: PendingValue<T>) => {
		if (pending.value === token) {
			pending.value = undefined;
		}
	};

	return {
		pending,
		start,
		clear,
	};
};
