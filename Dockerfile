FROM  node:24-alpine as base
# RUN npm install -g pnpm
# WORKDIR /app

# FROM base as build
# COPY . .
# RUN pnpm install --frozen-lockfile --only-production
# RUN pnpm db:generate
# RUN pnpm build

# FROM base as prod
# ENV NODE_ENV=production
# COPY --from=build /app/.output ./.output

# EXPOSE 3000
# CMD ["node", ".output/server/index.mjs"]
