import * as z from "zod";

import { MovieDefaultViewSchema } from "#shared/utils/models/movie";
import { MovieValidation } from "#shared/utils/validations/movie";

// Create from external
export const MovieCreateFromExternalInputSchema = z.object({
	externalId: MovieValidation.externalId,
});
export const MovieCreateFromExternalOutputSchema = MovieDefaultViewSchema;
