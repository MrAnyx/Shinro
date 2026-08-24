import type { MediaType, MediaStatus, ImageType } from "#prisma/enums";

// Common media data structure
export interface MediaBase {
	id: string;
	type: MediaType;
	status: MediaStatus | null;
	externalId: string | null;
	name: string | null;
	imagePath: string | null;
	imageType: ImageType | null;
	rating: number | null;
	note: string | null;
	ownerId: string;
	createdAt: Date;
	updatedAt: Date;
}

// Type-specific detail data
export interface MovieDetails {
	type: MediaType.MOVIE;
	title: string | null;
	poster_path: string | null;
	adult: boolean;
	runtime: number | null;
	original_title: string | null;
	overview: string | null;
	release_date: string | null;
	vote_average: number | null;
	vote_count: number | null;
	genres: { name: string | null }[] | null;
	tagline: string | null;
	belongs_to_collection: { name: string | null } | null;
}

export interface SerieDetails {
	type: MediaType.SERIE;
	name: string | null;
	poster_path: string | null;
	adult: boolean;
	first_air_date: string | null;
	last_air_date: string | null;
	last_episode_to_air: { air_date: string | null } | null;
	next_episode_to_air: { air_date: string | null } | null;
	overview: string | null;
	vote_average: number | null;
	vote_count: number | null;
	genres: { name: string | null }[] | null;
	tagline: string | null;
	number_of_episodes: number | null;
	number_of_seasons: number | null;
	status: string | null;
}

// Union type for all media details
export type MediaDetails = MovieDetails | SerieDetails;

// Credit data (shared between movies and series)
export interface MediaCredit {
	id: string;
	name: string | null;
	original_name: string | null;
	profile_path: string | null;
	character: string | null;
}

// Props for media detail components
export interface MediaDetailProps {
	mediaData: any | null;
	detailsData: MediaDetails | null;
	creditsData: { cast: MediaCredit[] | null } | null;
	isLoading: boolean;
	isExternal: boolean;
	isInMyList: boolean;
}

// Media source types
export type MediaSourceType = "internal" | "external";

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
