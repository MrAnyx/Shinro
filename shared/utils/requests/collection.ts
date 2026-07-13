import * as z from "zod";

import { CollectionDefaultViewSchema } from "#shared/utils/models/collection";
import { CollectionValidation } from "#shared/utils/validations/collection";
import { PaginationValidation } from "#shared/utils/validations/pagination";

// Create
export const CollectionCreateInputSchema = z.object({
	name: CollectionValidation.name,
	description: CollectionValidation.description,
});
export const CollectionCreateOutputSchema = CollectionDefaultViewSchema;

// Update
export const CollectionUpdateInputSchema = z.object({
	id: CollectionValidation.id,
	name: CollectionValidation.name,
	description: CollectionValidation.description,
});
export const CollectionUpdateOutputSchema = CollectionDefaultViewSchema;

// Delete
export const CollectionDeleteInputSchema = z.object({
	id: z.uuid(),
});
export const CollectionDeleteOutputSchema = z.void();

// Count
export const CollectionCountInputSchema = z.void();
export const CollectionCountOutputSchema = z.number();

// Get All
export const CollectionGetAllInputSchema = z.object({
	page: PaginationValidation.page,
	search: PaginationValidation.search,
});
export const CollectionGetAllOutputSchema = z.object({
	total: z.number(),
	results: z.array(CollectionDefaultViewSchema),
});
