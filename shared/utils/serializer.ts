import { parse, stringify } from "devalue";

export const transformer = {
	deserialize: (object: any) => parse(object),
	serialize: (object: any) => stringify(object),
};
