export type PendingValue<T> = {
	value: T | undefined;
};

export const usePendingValue = <T>() => {
	const pending = shallowRef<PendingValue<T>>();

	function get(fallback: T): T;
	function get(fallback?: T): T | undefined;
	function get(): T;
	function get(fallback?: T) {
		return pending.value ? pending.value.value : fallback;
	}

	const set = (value?: T) => {
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
		get,
		set,
		clear,
	};
};
