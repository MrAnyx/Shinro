import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(() => {
	const storage = useStorage();

	// Dynamically pass in credentials from runtime configuration, or other sources
	const driver = redisDriver({
		base: "redis",
		url: serverEnv.REDIS_URL,
	});

	// Mount driver
	storage.mount("redis", driver);
});
