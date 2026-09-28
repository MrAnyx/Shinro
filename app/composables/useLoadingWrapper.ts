export function useLoadingWrapper<T extends unknown[]>(fn: (...args: T) => Promise<void> | void) {
	const loading = ref(false);
	const error = ref<unknown>(null);

	const execute = async (...args: T) => {
		loading.value = true;
		error.value = null;
		try {
			await fn(...args);
		} catch (e) {
			error.value = e;
		} finally {
			loading.value = false;
		}
	};

	return { execute, loading, error };
}
