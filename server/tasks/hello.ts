import { createLogger } from "evlog";

export default defineTask({
	meta: {
		name: "hello",
		description: "Hello World",
	},
	async run({ payload }) {
		// Create a logger for this task run
		const log = createLogger({
			operation: "hello:world",
			task: true,
		});

		try {
			log.set({ payload });

			// Your task logic here
			console.log("Running hello task...");

			log.set({ result: "Success" });
		} catch (err) {
			log.error(err instanceof Error ? err : new Error(String(err)));
			throw err;
		} finally {
			// Manually emit the wide event
			log.emit();
		}

		return { result: "Success" };
	},
});
