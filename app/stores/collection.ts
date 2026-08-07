export const useCollectionStore = defineStore("collection", {
	state: () => ({
		total: 0,
	}),
	getters: {},
	actions: {
		async initialize() {
			const trpc = useTrpc();

			const [count] = await Promise.all([trpc.collection.count.query()]);

			this.total = count;
		},

		async createCollection(payload: TRPCProcedureInput<"collection", "create">) {
			const trpc = useTrpc();
			const collection = await trpc.collection.create.mutate(payload);
			this.total += 1;
			return collection;
		},

		async deleteCollection(payload: TRPCProcedureInput<"collection", "delete">) {
			const trpc = useTrpc();
			await trpc.collection.delete.mutate(payload);
			this.total -= 1;
		},
	},
});
