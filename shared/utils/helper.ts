import * as z from "zod";

export const delay = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const createSchemaGroup = <T extends z.ZodObject<any>, V extends Record<string, z.ZodTypeAny>>(schema: { model: T; validation: V }) => {
	return schema;
};
