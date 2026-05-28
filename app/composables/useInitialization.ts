export const useInitialization = () => {
	const isLoading = useState("app:loading", () => false);
	const isReady = useState("app:ready", () => false);

	const initialize = async () => {
		if (isReady.value) {
			return;
		}

		isLoading.value = true;
		await delay(3000);

		isLoading.value = false;
		isReady.value = true;
	};

	return { isLoading, isReady, initialize };
};
