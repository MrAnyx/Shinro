import { z } from 'zod'
import { router, publicProcedure } from './init'

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello, ${input.name}!`
    }),
})

// Export the type only — never import this on the client
export type AppRouter = typeof appRouter