import * as z from "zod";

/**
 * Pure Models
 */

export const PureUserSchema = z.object({
	id: z.uuid(),
	username: z.string(),
	passwordHash: z.string(),
	role: z.enum(["ADMIN", "USER"]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const PureSessionSchema = z.object({
	id: z.uuid(),
	sessionId: z.string(),
	userId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
	expiresAt: z.date(),
});

export const PureCollectionSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string().nullable(),
	ownerId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const PureMovieSchema = z.object({
	id: z.uuid(),
	externalId: z.number(),
	title: z.string(),
	description: z.string().nullable(),
	posterPath: z.string().nullable(),
	ownerId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const PureCollectionMovieSchema = z.object({
	collectionId: z.uuid(),
	movieId: z.uuid(),
	addedAt: z.date(),
});

/**
 * External models
 */

export const TMDbMovieSchema = z.object({
	id: z.number(),
	title: z.string(),
	overview: z.string(),
	original_title: z.string(),
	original_language: z.string(),
	poster_path: z.string().nullable(),
	release_date: z.string(),
	vote_average: z.number(),
	vote_count: z.number(),
	adult: z.boolean(),
});

export const TMDbMovieSearchSchema = z.object({
	page: z.number(),
	total_pages: z.number(),
	total_results: z.number(),
	results: z.array(TMDbMovieSchema),
});
