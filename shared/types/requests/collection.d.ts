import * as z from "zod";

// Create
export type CollectionCreateInput = z.infer<typeof CollectionCreateInputSchema>;
export type CollectionCreateOutput = z.infer<typeof CollectionCreateOutputSchema>;

// Update
export type CollectionUpdateInput = z.infer<typeof CollectionUpdateInputSchema>;
export type CollectionUpdateOutput = z.infer<typeof CollectionUpdateOutputSchema>;

// Delete
export type CollectionDeleteInput = z.infer<typeof CollectionDeleteInputSchema>;
export type CollectionDeleteOutput = z.infer<typeof CollectionDeleteOutputSchema>;

// Count
export type CollectionCountInput = z.infer<typeof CollectionCountInputSchema>;
export type CollectionCountOutput = z.infer<typeof CollectionCountOutputSchema>;

// Get All
export type CollectionGetAllInput = z.infer<typeof CollectionGetAllInputSchema>;
export type CollectionGetAllOutput = z.infer<typeof CollectionGetAllOutputSchema>;
