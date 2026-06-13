import * as z from "zod";

const schema = z.object({
	// Public variables
	allowRegistration: z.boolean(),
});

const config = useRuntimeConfig();

export default schema.parse(config.public);
