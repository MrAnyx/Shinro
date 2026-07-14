import { ofetch } from "ofetch";
import type { ZodType } from "zod";

type FetchOptions<T> = Parameters<typeof ofetch>[1] & {
	schema?: ZodType<T>;
};

const _tmdb = ofetch.create({
	baseURL: "https://api.themoviedb.org/3",
	headers: {
		Authorization: `Bearer ${serverEnv.TMDB_TOKEN}`,
	},
	query: {
		language: serverEnv.TMDB_LANGUAGE,
		include_adult: serverEnv.TMDB_INCLUDE_NSFW,
	},
});

export const tmdb = async <T = unknown>(url: string, options?: FetchOptions<T>): Promise<T> => {
	const { schema, ...fetchOptions } = options ?? {};
	const raw = await _tmdb(url, fetchOptions);
	if (schema) {
		return schema.parseAsync(raw);
	}
	return raw as T;
};
