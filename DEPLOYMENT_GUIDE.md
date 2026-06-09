# ReviewFlow AI Deployment Guide

Deploying ReviewFlow AI requires a hybrid approach. The frontend and API routes are optimized for **Vercel**, while the BullMQ background workers need a persistent environment like **Railway** or Render.

## Prerequisites

Before deploying, ensure you have provisioned the following external resources:
1. **Neon Serverless PostgreSQL Database**.
2. **Upstash Redis Serverless Database** (Used for BullMQ and SSE Pub/Sub).
3. **Google Gemini API Key** with gemini-2.5-flash access.
4. **GitHub OAuth App** (Set callback URL to `https://<YOUR-VERCEL-DOMAIN>/api/auth/callback/github`).

## 1. Deploy the Frontend to Vercel

The Vercel application handles the UI, API routes, Server-Sent Events, and the Better Auth endpoints.

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com/new) and import your repository.
3. Vercel will automatically detect Next.js. The `vercel.json` file configures the build step to run `npx prisma generate` automatically.
4. Set the following **Environment Variables** in Vercel:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (Set this to your expected Vercel domain: `https://reviewflow.ai`)
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `REDIS_URL`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
5. Click **Deploy**.

## 2. Deploy the Worker to Railway

The Railway deployment handles the long-running BullMQ worker processes that execute the AI agents.

1. Go to [Railway](https://railway.app/new) and connect your GitHub repository.
2. Railway will read the `railway.json` and `Dockerfile` automatically.
3. It will build the Docker container and start it using the `npm run start:worker` script.
4. Set the following **Environment Variables** in Railway:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
5. Deploy the service.

## 3. Database Migrations

Once both services are deployed, you need to sync the production database schema.

1. Use the Vercel CLI or connect locally to your Neon Database using your production `DATABASE_URL`.
2. Run `npx prisma db push` to generate the production tables.

## 4. Verification

1. Navigate to your Vercel domain.
2. Log in using GitHub.
3. Start a review. The Vercel API will push the job to Redis.
4. The Railway worker will pick up the job, run the Gemini agents, and stream events back to Redis.
5. The Vercel frontend will pick up the events via SSE and update the dashboard in real-time.

*ReviewFlow AI is now live in production!*
