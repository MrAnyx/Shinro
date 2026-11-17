# Shinro

Shinro is a modern personal media organization app built with Nuxt, TypeScript, tRPC, Prisma, and PostgreSQL. It helps users keep track of movies, collections, and their own viewing habits in a clean and intuitive experience.

## Project Overview

Shinro was created as a personal project to make media management more intentional and enjoyable. Instead of relying on scattered lists and fragmented tools, it brings everything into one place so users can organize what they want to watch, what they have watched, and what they want to keep close at hand.

### What the app offers

- Manage personal movie collections
- Create and organize custom collections
- Search and discover movies through TMDb integration
- Keep a structured and accessible personal library
- Enjoy a fast, modern experience powered by Nuxt and tRPC

## Tech Stack

- Nuxt 4
- Vue 3
- TypeScript
- tRPC
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Zod validation

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- pnpm
- PostgreSQL

### Installation

```bash
pnpm install
```

### Environment Configuration

Copy the provided example before running the app:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead. Review every value before startup. Boolean values must be written as `true` or `false`, and an empty required value is rejected by the environment validator.

The database and Redis examples match the services in `docker-compose.yaml`. The `.env.example` defaults are intended for local development; replace credentials and database URLs for other environments. `SPOTIFY_*` values are currently required by the environment schema even though the integration is not exposed in the app.

| Variable                         | Required      | Default in `.env.example` | Description                                                                                                                              |
| -------------------------------- | ------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                       | Yes           | `development`             | Runtime mode. Accepted values: `development`, `production`.                                                                              |
| `DATABASE_URL`                   | Yes           | Local Docker Compose URL  | PostgreSQL connection URL used by Prisma.                                                                                                |
| `REDIS_URL`                      | Yes           | Local Docker Compose URL  | Redis connection URL used for caching and first-admin setup.                                                                             |
| `COOKIE_SECURE`                  | No            | Auto-detect               | Forces the session cookie Secure flag. Use `true` or `false`; leave empty to follow the request protocol, including `X-Forwarded-Proto`. |
| `SESSION_LIFETIME_DAYS`          | No            | `10`                      | Fixed session lifetime, in whole days. Accepted range: `1`-`365`; activity does not extend it.                                           |
| `TMDB_TOKEN`                     | Yes           | None                      | TMDb API Read Access Token (v4 bearer token). This is not the v3 API key.                                                                |
| `TMDB_LANGUAGE`                  | Yes           | `en-US`                   | TMDb response language in ISO 639-1 form, optionally followed by an ISO 3166-1 region, such as `en-US` or `fr-FR`.                       |
| `TMDB_INCLUDE_NSFW`              | Yes           | `false`                   | Controls adult results from TMDb. Use `true` or `false`.                                                                                 |
| `SPOTIFY_CLIENT_ID`              | Yes currently | None                      | Spotify client ID required by the current environment schema. Spotify is not currently exposed in the app.                               |
| `SPOTIFY_CLIENT_SECRET`          | Yes currently | None                      | Spotify client secret required by the current environment schema. Keep it private and do not commit it.                                  |
| `NUXT_PUBLIC_ALLOW_REGISTRATION` | Yes           | `false`                   | Allows visitors to create accounts. Use `true` or `false`; the value is public in the client bundle.                                     |
| `NUXT_PUBLIC_ENABLE_MOVIES`      | Yes           | `true`                    | Enables movie navigation and routes. Use `true` or `false`; the value is public.                                                         |
| `NUXT_PUBLIC_ENABLE_SERIES`      | Yes           | `false`                   | Enables series navigation. Series pages are not currently implemented. Use `true` or `false`; the value is public.                       |
| `NUXT_PUBLIC_ENABLE_MUSICS`      | Yes           | `false`                   | Enables music navigation. Music pages are not currently implemented. Use `true` or `false`; the value is public.                         |
| `NUXT_PUBLIC_ENABLE_BOOKS`       | Yes           | `false`                   | Enables books navigation. Books pages are not currently implemented. Use `true` or `false`; the value is public.                         |
| `NUXT_PUBLIC_ENABLE_GAMES`       | Yes           | `false`                   | Enables games navigation. Games pages are not currently implemented. Use `true` or `false`; the value is public.                         |

Restart the Nuxt process after changing environment values so the server configuration and public runtime configuration are rebuilt. Never place secrets in variables prefixed with `NUXT_PUBLIC_`, because those values are exposed to the browser.

### Database Setup

Generate Prisma client and apply migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

### Run the development server

```bash
pnpm dev
```

The application will be available at http://localhost:3000.

## Available Scripts

```bash
pnpm build
pnpm dev
pnpm typecheck
pnpm lint
pnpm db:studio
```

## Contributing

Contributions are welcome.

If you would like to contribute, please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run checks and tests where relevant
5. Open a pull request with a clear description of your changes

A few good practices:

- Keep commits clear and focused
- Follow the existing code style
- Write descriptive PR messages
- Avoid introducing unnecessary changes

## Project Story

Shinro started as a personal tool for organizing media in a way that feels simple and expressive. Over time, it evolved into a full-stack application that combines a polished frontend experience with a robust backend architecture. The project is designed both as a practical app and as a learning platform for modern full-stack development.

## License

This project is licensed under the GNU AGPLv3 License. See the LICENSE file for more details.
