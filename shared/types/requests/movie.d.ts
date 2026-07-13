import * as z from "zod";

// Create from external
export type MovieCreateFromExternalInput = z.infer<typeof MovieCreateFromExternalInputSchema>;
export type MovieCreateFromExternalOutput = z.infer<typeof MovieCreateFromExternalOutputSchema>;
