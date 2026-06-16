import * as z from "zod";

export type Pagination = z.infer<typeof PaginationSchema>;
