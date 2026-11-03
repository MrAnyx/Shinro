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

	// Show the value while `fn` runs, then drop it unless a newer value has replaced it in the meantime
	const track = async <V extends T | undefined>(value: V, fn: (value: V) => Promise<unknown> | unknown) => {
		const token = set(value);

		try {
			await fn(value);
		} finally {
			clear(token);
		}
	};

	return {
		get,
		set,
		clear,
		track,
	};
};
