const trpc = useTrpc();

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: null as UserInfo | null,
		isLoading: false,
	}),
	getters: {
		isAuthenticated: (state) => !!state.user,
	},
	actions: {
		async login(payload: { username: string; password: string }) {
			try {
				this.isLoading = true;
				this.user = await trpc.user.login.mutate(payload);
			} catch (error) {
				this.user = null;
				throw error;
			} finally {
				this.isLoading = false;
			}
		},
		async register(payload: { username: string; password: string }) {
			try {
				this.isLoading = true;
				this.user = await trpc.user.register.mutate(payload);
			} catch (error) {
				this.user = null;
				throw error;
			} finally {
				this.isLoading = false;
			}
		},
		async logout() {
			try {
				await trpc.user.logout.mutate();
			} finally {
				this.user = null;
			}
		},
		async fetchMe() {
			if (this.isAuthenticated) {
				return;
			}

			try {
				this.isLoading = true;
				this.user = await trpc.user.me.query();
			} catch {
				this.user = null;
			} finally {
				this.isLoading = false;
			}
		},
	},
});
