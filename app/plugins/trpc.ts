import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@@/server/trpc/router'

export default defineNuxtPlugin(() => {
  const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: '/api/trpc',
      }),
    ],
  })

  return {
    provide: {
      trpc: client,
    },
  }
})