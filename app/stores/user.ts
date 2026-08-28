export const useUserStore = defineStore("user", {
	state: () => ({
		user: null as UserDefaultView | null,
	}),
	getters: {
		isAuthenticated: (state) => !!state.user,
	},
	actions: {
		async login(payload: TRPCProcedureInput<"user", "login">) {
			const trpc = useTrpc();

			try {
				this.user = await trpc.user.login.mutate(payload);
			} catch (error) {
				this.user = null;
				throw error;
			}
		},

		async register(payload: TRPCProcedureInput<"user", "register">) {
			const trpc = useTrpc();

			try {
				this.user = await trpc.user.register.mutate(payload);
			} catch (error) {
				this.user = null;
				throw error;
			}
		},

		async logout() {
			const trpc = useTrpc();

			try {
				await trpc.user.logout.mutate();
			} finally {
				this.user = null;
				clearNuxtData();
			}
		},

		async fetchMe(force: boolean = false) {
			if (this.isAuthenticated && !force) {
				return;
			}

			const trpc = useTrpc();

			try {
				this.user = await trpc.user.me.query();
			} catch (err) {
				this.user = null;
				throw err;
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
