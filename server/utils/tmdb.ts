import { ofetch } from "ofetch";

export default ofetch.create({
	baseURL: "https://api.themoviedb.org/3",
	query: {
		language: serverEnv.TMDB_LANGUAGE,
		include_adult: serverEnv.TMDB_INCLUDE_NSFW,
	},
	onRequest({ options }) {
		options.headers.set("Authorization", `Bearer ${serverEnv.TMDB_TOKEN}`);
	},
});
