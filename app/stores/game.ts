export const useGameStore = defineStore("game", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();

			const [count] = await Promise.all([trpc.game.count.query()]);

			this.total = count;
		},

		async createGame(payload: TRPCProcedureInput<"game", "create">) {
			const trpc = useTrpc();
			const game = await trpc.game.create.mutate(payload);
			this.total += 1;
			return game;
		},

		async createGameFromExternal(payload: TRPCProcedureInput<"game", "createFromExternal">) {
			const trpc = useTrpc();
			const game = await trpc.game.createFromExternal.mutate(payload);
			this.total += 1;
			return game;
		},

		async deleteGame(payload: TRPCProcedureInput<"game", "delete">) {
			const trpc = useTrpc();
			await trpc.game.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
