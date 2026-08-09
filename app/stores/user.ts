export const useUserStore = defineStore("user", {
	state: () => ({
		user: null as UserDefaultView | null,
		isLoadingLogin: false,
		isLoadingRegister: false,
		isLoadingLogout: false,
		isLoadingFetchMe: false,
	}),
	getters: {
		isAuthenticated: (state) => !!state.user,
		isLoading: (state) =>
			state.isLoadingLogin || state.isLoadingRegister || state.isLoadingLogout || state.isLoadingFetchMe,
	},
	actions: {
		async login(payload: TRPCProcedureInput<"user", "login">) {
			const trpc = useTrpc();

			try {
				this.isLoadingLogin = true;
				this.user = await trpc.user.login.mutate(payload);
			} catch (error) {
				this.user = null;
				throw error;
			} finally {
				this.isLoadingLogin = false;
			}
		},

		async register(payload: TRPCProcedureInput<"user", "register">) {
			const trpc = useTrpc();

			try {
				this.isLoadingRegister = true;
				this.user = await trpc.user.register.mutate(payload);
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
				await trpc.user.logout.mutate();
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
				this.user = await trpc.user.me.query();
			} catch (err) {
				this.user = null;
				throw err;
			} finally {
				this.isLoadingFetchMe = false;
			}
		},

		async updateMe(payload: TRPCProcedureInput<"user", "updateMe">) {
			const trpc = useTrpc();

			this.user = await trpc.user.updateMe.mutate(payload);
		},

		async deleteMe() {
			const trpc = useTrpc();

			await trpc.user.deleteMe.mutate();
			this.user = null;
		},
	},
});
