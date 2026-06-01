import type { H3Event } from "h3";

export const createContext = async (event: H3Event) => ({ event });
