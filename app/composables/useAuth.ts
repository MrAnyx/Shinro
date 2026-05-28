import { useLocalStorage } from "@vueuse/core";

export const useAuth = () => {
	const isLoggedIn = useLocalStorage<boolean>("auth:logged-in", false);

	function setLoggedIn() {
		isLoggedIn.value = true;
	}

	function setLoggedOut() {
		isLoggedIn.value = false;
	}

	return { isLoggedIn, setLoggedIn, setLoggedOut };
};
