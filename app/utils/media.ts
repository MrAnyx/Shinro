import { MediaStatus } from "#prisma/enums";

export const STATUS_COLORS: Record<keyof typeof MediaStatus, AppColor> = {
	PLANNED: "info",
	IN_PROGRESS: "warning",
	DROPPED: "error",
	PAUSED: "neutral",
	COMPLETED: "success",
};

export const MOVIE_STATUS_LABELS: Record<keyof typeof MediaStatus, string> = {
	PLANNED: "Watchlist",
	IN_PROGRESS: "Watching",
	DROPPED: "Abandoned",
	PAUSED: "Paused",
	COMPLETED: "Watched",
};

export const SERIE_STATUS_LABELS: Record<keyof typeof MediaStatus, string> = {
	PLANNED: "Watchlist",
	IN_PROGRESS: "Watching",
	DROPPED: "Abandoned",
	PAUSED: "Paused",
	COMPLETED: "Watched",
};

export const MUSIC_STATUS_LABELS: Record<keyof typeof MediaStatus, string> = {
	PLANNED: "Listen Later",
	IN_PROGRESS: "Listening",
	DROPPED: "Dropped",
	PAUSED: "Paused",
	COMPLETED: "Listened",
};

export const GAME_STATUS_LABELS: Record<keyof typeof MediaStatus, string> = {
	PLANNED: "Play Later",
	IN_PROGRESS: "Playing",
	DROPPED: "Dropped",
	PAUSED: "Paused",
	COMPLETED: "Finished",
};

export const BOOK_STATUS_LABELS: Record<keyof typeof MediaStatus, string> = {
	PLANNED: "To Read",
	IN_PROGRESS: "Reading",
	DROPPED: "Dropped",
	PAUSED: "Paused",
	COMPLETED: "Read",
};
