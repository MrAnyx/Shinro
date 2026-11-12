import { ofetch } from "ofetch";
import type { ZodType } from "zod";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";

type FetchOptions<T> = Parameters<typeof ofetch>[1] & {
	schema?: ZodType<T>;
};

const _tmdb = async () => {
	return ofetch.create({
		baseURL: TMDB_API_BASE_URL,
		headers: {
			Authorization: `Bearer ${serverEnv.TMDB_TOKEN}`,
		},
		query: {
			language: serverEnv.TMDB_LANGUAGE,
			include_adult: serverEnv.TMDB_INCLUDE_NSFW,
		},
	});
};

export const tmdb = async <T = unknown>(url: string, options?: FetchOptions<T>): Promise<T> => {
	const { schema, ...fetchOptions } = options ?? {};
	const fetch = await _tmdb();

	const raw = await fetch(url, fetchOptions);

	if (schema) {
		return schema.parseAsync(raw);
	}

	return raw as T;
};
