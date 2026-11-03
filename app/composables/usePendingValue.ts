export const usePendingValue = <T>() => {
	let latest: symbol | undefined;

	const state = shallowReactive({
		// True while an update is in flight; `value` holds the value being saved (which may be `undefined`)
		isPending: false,
		value: undefined as T | undefined,

		// Show the value while `fn` runs, then drop it unless a newer value has replaced it in the meantime
		track: async <V extends T | undefined>(value: V, fn: (value: V) => Promise<unknown> | unknown) => {
			const token = Symbol();
			latest = token;
			state.value = value;
			state.isPending = true;

			try {
				await fn(value);
			} finally {
				if (latest === token) {
					state.isPending = false;
					state.value = undefined;
				}
			}
		},
	});

	return state;
};
