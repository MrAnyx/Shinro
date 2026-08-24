export const useMusicStore = defineStore("music", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();

			const [count] = await Promise.all([trpc.music.count.query()]);

			this.total = count;
		},

		async createMusic(payload: TRPCProcedureInput<"music", "create">) {
			const trpc = useTrpc();
			const music = await trpc.music.create.mutate(payload);
			this.total += 1;
			return music;
		},

		async createMusicFromExternal(payload: TRPCProcedureInput<"music", "createFromExternal">) {
			const trpc = useTrpc();
			const music = await trpc.music.createFromExternal.mutate(payload);
			this.total += 1;
			return music;
		},

		async deleteMusic(payload: TRPCProcedureInput<"music", "delete">) {
			const trpc = useTrpc();
			await trpc.music.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
