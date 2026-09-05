This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## KVCH Judge local foundation

Copy `.env.example` to `.env.local` and set `DATABASE_URL` to a PostgreSQL database. The artifact and workspace paths must be absolute, distinct paths outside `public/` and source control. For a local database, `npm run db:up` starts the included PostgreSQL 16 service, which matches the example URL.

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

In a second terminal, with the same environment:

```bash
npm run worker
```

The worker validates required configuration, creates only the configured artifact/workspace directories, verifies Postgres connectivity, and registers the future evaluation/run queues. It does not execute extension code until the Judge kernel is implemented.

```bash
npm run test:foundation
npm run test:judge
```

The first test covers configuration and the local storage adapter. The second packages real Node/Python fixtures with the published package, confirms authoritative byte hashes and manifest selection, and exercises their preflight/JSONL contract in disposable test directories.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
