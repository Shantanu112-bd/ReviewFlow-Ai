# ReviewFlow AI - Backend Architecture

## 4. Repository Structure
We will utilize a **Monorepo** architecture using tools like Turborepo or npm workspaces. This approach allows us to easily share configurations, database clients, and standard types across different functional modules (e.g., the web API and background workers) without publishing private packages.

## 5. Folder Structure
The monorepo structure will be organized as follows:
```text
reviewflow-ai/
├── apps/
│   ├── web/               # Next.js Application (UI Dashboards & GitHub Webhook ingress)
│   └── worker/            # Node.js Background Service (Job processing & AI Agent execution)
├── packages/
│   ├── db/                # Shared Prisma schema, migrations, and generated client
│   ├── github/            # Shared GitHub API wrappers and SDK utilities
│   └── logger/            # Centralized structured logging utilities
├── prisma/                # Prisma schema definitions
├── package.json           # Root workspace configuration
└── turbo.json             # Turborepo build pipeline configuration
```

## 6. Environment Variables
Core environment variables required across services:

**Database & Infrastructure:**
- `DATABASE_URL`: PostgreSQL connection string.
- `REDIS_URL`: Connection string for the Queue architecture and Pub/Sub.

**GitHub Integration:**
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: For user OAuth authentication via GitHub.
- `GITHUB_APP_ID` / `GITHUB_APP_PRIVATE_KEY`: For authenticating as a GitHub App.
- `WEBHOOK_SECRET`: To cryptographically verify incoming payload signatures from GitHub.

**AI Integration:**
- `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`): Keys to authenticate with the LLM provider.

## 7. Queue Architecture
**Technology:** Redis-backed distributed queue (e.g., BullMQ or Inngest).

**Workflow:**
1. **Ingress:** The `web` application receives a webhook event from GitHub. It performs signature validation.
2. **Enqueue:** Instead of blocking the HTTP request to perform LLM analysis, the `web` API enqueues a `ReviewJob` payload to Redis and returns a `202 Accepted` to GitHub.
3. **Processing:** The `worker` application listens to the Redis queue, picking up the `ReviewJob`.
4. **Resilience:** The queue handles automatic retries with exponential backoff for failed jobs (e.g., if the LLM API is rate-limited or GitHub is down), and routes unrecoverable jobs to a Dead Letter Queue (DLQ).

## 8. Agent Architecture
**Modular Orchestration:**
The system uses a master orchestrator in the `worker` app that delegates tasks to specialized AI Agents.

1. **Context Fetching:** The orchestrator fetches the PR diff and codebase context via the GitHub API.
2. **Parallel Agents:** Specialized agents are spawned concurrently to evaluate different aspects of the PR:
   - `SecurityScannerAgent`: Identifies potential vulnerabilities.
   - `BestPracticesAgent`: Evaluates adherence to language-specific idioms.
   - `PerformanceAgent`: Flags inefficient algorithms or queries.
3. **Data Logging:** Each agent creates an `AgentResult` record and generates detailed `Finding` records.
4. **Aggregation:** Once all agents complete, the orchestrator aggregates the findings to finalize the overall `Review`.

## 9. SSE Architecture (Server-Sent Events)
**Real-Time UI Updates:**
To provide users with a live dashboard of their PR review progress:
1. The Next.js API in `apps/web` exposes an SSE endpoint: `/api/reviews/[id]/stream`.
2. As the `worker` processes an agent, it publishes status updates and new `Finding` events to a Redis Pub/Sub channel.
3. The Next.js API subscribes to this Redis channel and pushes the events sequentially down the open SSE connection to the client browser.
4. The React UI updates iteratively as feedback is generated.

## 10. GitHub Integration Architecture
**Integration Mechanism:** GitHub App.
- **Webhooks:** The App is subscribed to `pull_request` events, specifically the `opened` and `synchronize` (new commits) actions.
- **Data Ingestion:** The application uses GitHub's REST API to fetch PR diffs, file contents, and commit data.
- **Feedback Loop:** Once the Agent pipeline finishes processing the findings, the backend utilizes the GitHub REST API to post a structured PR Review. Findings are mapped to specific lines of code using the PR diff context, creating inline review comments directly in the GitHub UI.
