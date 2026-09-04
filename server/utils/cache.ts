import type { StorageValue } from "unstorage";

interface CacheOptions {
	ttl?: number;
	storage?: string;
	prefix?: string;
}

export async function useCache<T extends StorageValue>(
	key: string,
	fn: () => Promise<T>,
	options: CacheOptions = {},
): Promise<T> {
	const { ttl = DEFAULT_CACHE_TTL, storage = "redis", prefix = "cache" } = options;

	const store = useStorage(storage);
	const cacheKey = `${prefix}:${key}`;

	const cached = await store.getItem<T>(cacheKey);

	if (cached !== null) {
		return cached;
	}

	const result = await fn();
	await store.setItem(cacheKey, result, { ttl });

	return result;
}
