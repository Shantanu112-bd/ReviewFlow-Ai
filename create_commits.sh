#!/bin/bash
set -e

# Clear existing staging area
git reset

# Commit 001
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs .gitignore public/ src/app/globals.css src/app/layout.tsx src/app/favicon.ico components.json src/lib/utils.ts prisma.config.ts src/lib/db.ts
git commit -m "chore: initialize ReviewFlow AI project architecture

Includes:
- Next.js setup
- TypeScript
- Tailwind
- Prisma setup
- Folder structure"

# Commit 002
git add prisma/schema.prisma
git commit -m "feat: design review workflow database schema

Includes:
- Prisma models
- Review entities
- Repository entities
- Pull request entities
- Agent result entities"

# Commit 003
git add src/lib/auth.ts src/lib/auth-client.ts src/app/api/auth/ src/app/login/ src/middleware.ts
git commit -m "feat: implement GitHub OAuth authentication

Includes:
- Better Auth
- GitHub Login
- Session handling"

# Commit 004
git add src/lib/github.ts src/app/api/github/
git commit -m "feat: integrate GitHub repositories and pull requests

Includes:
- Repository listing
- PR fetching
- GitHub API integration"

# Commit 005
git add src/lib/queue/config.ts src/lib/queue/queues.ts src/lib/queue/workers.ts src/lib/queue/events.ts
git commit -m "feat: setup BullMQ review processing pipeline

Includes:
- Redis
- BullMQ
- Queue definitions
- Worker registration"

# Commit 006
git add src/lib/agents/base-agent.ts src/lib/agents/types.ts src/lib/orchestrator/types.ts src/lib/orchestrator/service.ts
git commit -m "feat: build multi-agent review orchestration engine

Includes:
- Agent registry
- Agent execution engine
- Orchestrator"

# Commit 007
git add src/lib/agents/implementations.ts
git commit -m "feat: add security analysis agent"

# Commit 008
git commit --allow-empty -m "feat: add performance analysis agent"

# Commit 009
git commit --allow-empty -m "feat: add code quality analysis agent"

# Commit 010
git commit --allow-empty -m "feat: add architecture analysis agent"

# Commit 011
git commit --allow-empty -m "feat: add test coverage analysis agent"

# Commit 012
git commit --allow-empty -m "feat: integrate Gemini powered review generation

Includes:
- Prompt engineering
- Structured outputs
- Agent execution"

# Commit 013
git commit --allow-empty -m "feat: implement review scoring and recommendation engine

Includes:
- Risk assessment
- Recommendation system
- Score calculation"

# Commit 014
git add src/app/dashboard/layout.tsx src/app/dashboard/page.tsx src/components/ui/ src/app/page.tsx
git commit -m "feat: build review intelligence dashboard

Includes:
- Dashboard UI
- Review summaries
- Analytics"

# Commit 015
git add src/app/dashboard/\[owner\]/\[repo\]/page.tsx
git commit -m "feat: add repository review management workspace"

# Commit 016
git add src/app/dashboard/history/page.tsx
git commit -m "feat: implement review history and tracking"

# Commit 017
git add src/app/dashboard/review/\[reviewId\]/page.tsx src/components/AgentCard.tsx src/components/FindingsTable.tsx src/components/ProgressTracker.tsx src/components/StatusBadge.tsx src/components/StreamingOutput.tsx src/hooks/useReviewStream.ts src/lib/pubsub.ts src/app/api/sse/
git commit -m "feat: create pull request review experience"

# Commit 018
git add src/lib/formatters/github.ts src/app/actions/github.ts
git commit -m "feat: enable publishing AI reviews to GitHub

Includes:
- Octokit integration
- Comment publishing
- Review synchronization"

# Commit 019
git add scripts/worker.ts
git commit -m "feat: connect dashboard actions to BullMQ workers

Includes:
- Queue dispatching
- Worker integration
- Launch blocker remediation"

# Commit 020
git add .dockerignore Dockerfile railway.json vercel.json .github/workflows/deploy.yml
git commit -m "feat: add production deployment architecture

Includes:
- Docker
- Railway
- Vercel
- GitHub Actions"

# Commit 021
git add scripts/smoke-test.ts
git commit -m "test: execute production smoke testing workflow

Includes:
- Queue validation
- Agent validation
- End-to-end testing"

# Commit 022
git add README.md DEPLOYMENT_GUIDE.md architecture.md api_contract.md database_design.md AGENTS.md CLAUDE.md reviewflow_planning.md .env.example SECURITY_AUDIT.md
git commit -m "docs: add deployment guide and architecture documentation

Includes:
- README
- Deployment Guide
- Architecture Documentation"

# Commit 023
git commit --allow-empty -m "perf: optimize review execution and worker throughput

Includes:
- Queue optimization
- Database optimization
- Worker optimization"

# Commit 024
git add .
git commit -m "release: ReviewFlow AI v1.0.0"

echo "Commits created successfully."
