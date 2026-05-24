// composables/useAuthState.ts
export const useAuthState = () => {
	const isLoggedIn = useState<boolean>("is_logged_in", () => {
		return localStorage.getItem("is_logged_in") === "true";
	});

	function setLoggedIn() {
		isLoggedIn.value = true;
		localStorage.setItem("is_logged_in", "true");
	}

	function setLoggedOut() {
		isLoggedIn.value = false;
		localStorage.removeItem("is_logged_in");
	}

	return { isLoggedIn, setLoggedIn, setLoggedOut };
};
