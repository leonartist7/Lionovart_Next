This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deployment

Vercel runs the Next.js application and NOVA's session broker. The browser streams
voice directly to Gemini using a constrained, short-lived credential; no WebSocket
server is required on Vercel. See [NOVA on Vercel](docs/NOVA_VERCEL_MIGRATION.md) for
required environment variables, Firebase settings, tests, and deployment checks.

`npm start` serves a local production Next.js build. The existing Cloud Run server
remains available through `npm run start:cloud-run` for the legacy container path.
