export const useMovieStore = defineStore("movie", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();

			const [count] = await Promise.all([trpc.movie.count.query()]);

			this.total = count;
		},

		async createMovie(payload: TRPCProcedureInput<"movies", "create">) {
			const trpc = useTrpc();
			const movie = await trpc.movie.create.mutate(payload);
			this.total += 1;
			return movie;
		},

		async createMovieFromExternal(payload: TRPCProcedureInput<"movies", "createFromExternal">) {
			const trpc = useTrpc();
			const movie = await trpc.movie.createFromExternal.mutate(payload);
			this.total += 1;
			return movie;
		},

		async deleteMovie(payload: TRPCProcedureInput<"movies", "delete">) {
			const trpc = useTrpc();
			await trpc.movie.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
