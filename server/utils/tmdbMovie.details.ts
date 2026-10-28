export async function getTmdbMovieFullDetails({ externalMovieId, ownerId }: { externalMovieId: string; ownerId: string }) {
	// Get the movie details and credits from TMDB in parallel
	const [detailsResponse, creditsResponse] = await Promise.all([
		useCache(`tmdb:movie:${externalMovieId}:details`, () =>
			tmdb(`/movie/${externalMovieId}`, { schema: TmdbMovieDetailsResponseSchema }),
		),
		useCache(`tmdb:movie:${externalMovieId}:credits`, () =>
			tmdb(`/movie/${externalMovieId}/credits`, { schema: TmdbMovieCreditsResponseSchema }),
		),
	]);

	// Compute the details and credits responses to filter and format the properties
	const credits = creditsResponse.cast?.filter((x) => !!x) ?? [];
	const details = {
		...detailsResponse,
		genres:
			detailsResponse.genres
				?.filter((x): x is NonNullable<typeof x> & { name: string } => !!x?.name?.trim())
				.map((x) => x.name.trim()) ?? [],
	};

	let saga = undefined;

	// If the movie belongs to a saga, get the saga details from TMDB
	if (detailsResponse.belongs_to_collection?.id) {
		const collectionId = detailsResponse.belongs_to_collection.id;

		// Get the collection details from TMDB
		const sagaResponse = await useCache(`tmdb:movie:saga:${collectionId}`, () =>
			tmdb(`/collection/${collectionId}`, {
				schema: TmdbMovieCollectionResponseSchema,
			}),
		);

		// Get the external IDs of the movies in the saga
		const externalIds = sagaResponse.parts?.filter((x) => !!x).map((x) => x.id) ?? [];

		// Get the movies that belong to the user and have the same external IDs
		const myMovies = await prisma.movie.findMany({
			where: {
				media: {
					ownerId: ownerId,
					externalId: {
						in: externalIds,
					},
				},
			},
			include: {
				media: true,
			},
		});

		// Create a map of the user's movies for easy lookup
		const myMoviesMap = new Map(myMovies.map((m) => [m.media.externalId, m]));

		// Merge the TMDB collection movies with the user's movies
		saga = {
			...sagaResponse,
			movies:
				sagaResponse.parts
					?.filter((x): x is NonNullable<typeof x> => !!x)
					?.filter((p) => p.media_type === "movie")
					?.map((x) => Object.assign(x, { internal_movie: myMoviesMap.get(x.id) }))
					?.sort((a, b) => {
						if (!a.release_date && !b.release_date) {
							return 0;
						}
						if (!a.release_date) {
							return 1;
						}
						if (!b.release_date) {
							return -1;
						}
						return a.release_date.localeCompare(b.release_date);
					}) ?? [],
		};
	}


	return { details, credits, saga };
}
