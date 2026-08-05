export const useCollectionStore = defineStore("collection", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();

			const [count] = await Promise.all([trpc.collections.count.query()]);

			this.total = count;
		},

		async createCollection(payload: TRPCProcedureInput<"collections", "create">) {
			const trpc = useTrpc();
			const collection = await trpc.collections.create.mutate(payload);
			this.total += 1;
			return collection;
		},

		async deleteCollection(payload: TRPCProcedureInput<"collections", "delete">) {
			const trpc = useTrpc();
			await trpc.collections.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
