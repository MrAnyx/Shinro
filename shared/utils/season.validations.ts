import { z } from "zod";

export const SeasonIdSchemaBase = MediaIdSchemaBase;
export const SeasonNumberSchemaBase = z
	.number()
	.int("Season number must be a valid integer")
	.min(0, "Season number must be non-negative")
	.max(2147483647, "Season number exceeds the supported range");
