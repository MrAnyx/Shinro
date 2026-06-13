import * as z from "zod";

const schema = z.object({
	// Public variables
	allowRegistration: z.coerce.boolean(),
});

const config = useRuntimeConfig();

export default schema.parse(config.public);
