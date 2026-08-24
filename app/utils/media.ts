import { MediaType } from "#prisma/enums";

// Map media type to route type
export const MediaTypeToRouteType: Record<MediaType, string> = {
	[MediaType.MOVIE]: "movies",
	[MediaType.SERIE]: "series",
	[MediaType.BOOK]: "books",
	[MediaType.MUSIC]: "music",
	[MediaType.GAME]: "games",
	[MediaType.SEASON]: "seasons",
	[MediaType.EPISODE]: "episodes",
};

// Map route type to media type
export const RouteTypeToMediaType: Record<string, MediaType> = {
	movies: MediaType.MOVIE,
	series: MediaType.SERIE,
	books: MediaType.BOOK,
	music: MediaType.MUSIC,
	games: MediaType.GAME,
	seasons: MediaType.SEASON,
	episodes: MediaType.EPISODE,
};

// Get media type from route
export const getMediaTypeFromRoute = (routeType: string): MediaType => {
	return RouteTypeToMediaType[routeType] || MediaType.MOVIE;
};

// Get route type from media type
export const getRouteTypeFromMediaType = (mediaType: MediaType): string => {
	return MediaTypeToRouteType[mediaType] || "movies";
};
