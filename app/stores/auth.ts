export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: null as UserDefaultView | null,
		isLoadingLogin: false,
		isLoadingRegister: false,
		isLoadingLogout: false,
		isLoadingFetchMe: false,
	}),
	getters: {
		isAuthenticated: (state) => !!state.user,
		isLoading: (state) => state.isLoadingLogin || state.isLoadingRegister || state.isLoadingLogout || state.isLoadingFetchMe,
	},
	actions: {
		async login(payload: { username: string; password: string }) {
			const trpc = useTrpc();

			try {
				this.isLoadingLogin = true;
				this.user = await trpc.users.login.mutate(payload);
			} catch (error) {
				this.user = null;
				throw error;
			} finally {
				this.isLoadingLogin = false;
			}
		},
		async register(payload: { username: string; password: string }) {
			const trpc = useTrpc();

			try {
				this.isLoadingRegister = true;
				this.user = await trpc.users.register.mutate(payload);
			} catch (error) {
				this.user = null;
				throw error;
			} finally {
				this.isLoadingRegister = false;
			}
		},
		async logout() {
			const trpc = useTrpc();

			try {
				this.isLoadingLogout = true;
				await trpc.users.logout.mutate();
			} finally {
				this.user = null;
				this.isLoadingLogout = false;
			}
		},
		async fetchMe(force: boolean = false) {
			if (this.isAuthenticated && !force) {
				return;
			}

			const trpc = useTrpc();

			try {
				this.isLoadingFetchMe = true;
				this.user = await trpc.users.me.query();
			} catch (err) {
				this.user = null;
				throw err;
			} finally {
				this.isLoadingFetchMe = false;
			}
		},
	},
});
