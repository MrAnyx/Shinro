import { z } from "zod";

export const SeasonIdSchemaBase = MediaIdSchemaBase;
export const SeasonNumberSchemaBase = z
	.int("Season number must be a valid integer")
	.gte(1, "Season number must a positive integer");
export const SeasonOverviewSchemaBase = z.string("Season overview must be a valid string").trim();
