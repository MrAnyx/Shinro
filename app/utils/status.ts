import { MediaStatus, MediaType } from "#prisma/enums";

type MediaStatusObject<T> = Record<keyof typeof MediaStatus, T>;
type MediaTypeObject<T> = Record<keyof typeof MediaType, T>;

export const STATUS_COLORS: MediaStatusObject<AppColor> = {
	PLANNED: "info",
	IN_PROGRESS: "warning",
	DROPPED: "error",
	PAUSED: "neutral",
	COMPLETED: "success",
};

export const MOVIE_STATUS_LABELS: MediaStatusObject<string> = {
	PLANNED: "Watchlist",
	IN_PROGRESS: "Watching",
	DROPPED: "Abandoned",
	PAUSED: "Paused",
	COMPLETED: "Watched",
};

export const SERIE_STATUS_LABELS: MediaStatusObject<string> = {
	PLANNED: "Watchlist",
	IN_PROGRESS: "Watching",
	DROPPED: "Abandoned",
	PAUSED: "Paused",
	COMPLETED: "Watched",
};

export const MUSIC_STATUS_LABELS: MediaStatusObject<string> = {
	PLANNED: "Listen Later",
	IN_PROGRESS: "Listening",
	DROPPED: "Dropped",
	PAUSED: "Paused",
	COMPLETED: "Listened",
};

export const GAME_STATUS_LABELS: MediaStatusObject<string> = {
	PLANNED: "Play Later",
	IN_PROGRESS: "Playing",
	DROPPED: "Dropped",
	PAUSED: "Paused",
	COMPLETED: "Finished",
};

export const BOOK_STATUS_LABELS: MediaStatusObject<string> = {
	PLANNED: "To Read",
	IN_PROGRESS: "Reading",
	DROPPED: "Dropped",
	PAUSED: "Paused",
	COMPLETED: "Read",
};

export const STATUS_LABELS: MediaTypeObject<MediaStatusObject<string>> = {
	MOVIE: MOVIE_STATUS_LABELS,
	SERIE: SERIE_STATUS_LABELS,
	SEASON: SERIE_STATUS_LABELS,
	EPISODE: SERIE_STATUS_LABELS,
	BOOK: BOOK_STATUS_LABELS,
	GAME: GAME_STATUS_LABELS,
	MUSIC: MUSIC_STATUS_LABELS,
};
