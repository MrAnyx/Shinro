import { useLocalStorage } from "@vueuse/core";

export const useAuth = () => {
	const isLoggedIn = useLocalStorage<boolean>("is_logged_in", false);

	function setLoggedIn() {
		isLoggedIn.value = true;
	}

	function setLoggedOut() {
		isLoggedIn.value = false;
	}

	return { isLoggedIn, setLoggedIn, setLoggedOut };
};
