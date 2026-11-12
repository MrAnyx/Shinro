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

Create the necessary environment variables for your local environment before running the app. The project expects database and TMDb-related values to be available through the server environment configuration.

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
