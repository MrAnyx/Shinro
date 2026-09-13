import { ofetch } from "ofetch";
import type { ZodType } from "zod";
import { z } from "zod";

const SPOTIFY_TOKEN_CACHE_KEY = "spotify:access_token";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_CACHE_TTL_SECONDS = 60 * 60;

const SpotifyCredentialsSchema = z.object({
	access_token: z.string(),
	expires_in: z.number(),
});

type FetchOptions<T> = Parameters<typeof ofetch>[1] & {
	schema?: ZodType<T>;
};

type TokenCache = {
	accessToken: string;
	expiresAt: number;
};

let spotifyTokenRequest: Promise<string> | null = null;

const getSpotifyToken = async (): Promise<string> => {
	const storage = useStorage("redis");
	const cached = await storage.getItem<TokenCache>(SPOTIFY_TOKEN_CACHE_KEY);
	const now = Date.now();

	if (cached && cached.expiresAt - 30_000 > now) {
		return cached.accessToken;
	}

	if (spotifyTokenRequest) {
		return spotifyTokenRequest;
	}

	spotifyTokenRequest = (async () => {
		const token = await useCache<TokenCache>(
			SPOTIFY_TOKEN_CACHE_KEY,
			async () => {
				const credentials = Buffer.from(
					`${serverEnv.SPOTIFY_CLIENT_ID}:${serverEnv.SPOTIFY_CLIENT_SECRET}`,
				).toString("base64");

				const response = await ofetch(SPOTIFY_TOKEN_URL, {
					method: "POST",
					headers: {
						Authorization: `Basic ${credentials}`,
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({ grant_type: "client_credentials" }),
				});

				const typedResponse = await SpotifyCredentialsSchema.parseAsync(response);

				return {
					accessToken: typedResponse.access_token,
					expiresAt: Date.now() + typedResponse.expires_in * 1_000 - 30_000,
				};
			},
			{
				ttl: SPOTIFY_TOKEN_CACHE_TTL_SECONDS,
			},
		);

		return token.accessToken;
	})().finally(() => {
		spotifyTokenRequest = null;
	});

	return spotifyTokenRequest;
};

const _spotify = async () => {
	const token = await getSpotifyToken();

	return ofetch.create({
		baseURL: SPOTIFY_API_BASE_URL,
		headers: {
			Authorization: `Bearer ${token}`,
		},
		query: {},
	});
};

export const spotify = async <T = unknown>(url: string, options?: FetchOptions<T>): Promise<T> => {
	const { schema, ...fetchOptions } = options ?? {};
	const fetch = await _spotify();

	const raw = await fetch(url, fetchOptions);

	if (schema) {
		return schema.parseAsync(raw);
	}

	return raw as T;
};
