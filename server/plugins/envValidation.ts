// oxlint-disable-next-line no-unused-vars
import { serverEnv } from "#server/utils/serverEnv";

export default defineNitroPlugin(() => {
	log.info("startup", `Environment variables loaded successfully (NODE_ENV=${serverEnv.NODE_ENV})`);
});
