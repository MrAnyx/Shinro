export const episodeDetailsPath = (serieId: string, seasonNumber: number, episodeNumber: number) =>
	`/app/series/${encodeURIComponent(serieId)}/seasons/${seasonNumber}/episodes/${episodeNumber}`;
