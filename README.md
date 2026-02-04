# Authority13 — AI Workforce Operating System

**AI Employees. Real Work. Full Control.**

Authority13 is a production-ready SaaS platform for deploying and managing AI agents that execute real business tasks with human oversight, approvals, and complete audit trails.

## Features

- **Mission Control**: Live agent graph, execution timeline, and real-time console
- **AI Agents**: Commander + specialist agents (Growth, Ops, Support, Analyst)
- **Human-in-the-Loop**: Approval workflows for risky actions
- **BYOK**: Bring your own AI provider keys (OpenAI, Anthropic, Google)
- **Agent Calls**: In-app voice briefings with your AI workforce
- **Complete Audit**: Immutable audit log for every action
- **Multi-tenant**: Workspace-based isolation with RBAC

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, PostgreSQL, Prisma, Redis, BullMQ
- **Auth**: NextAuth.js
- **Real-time**: Server-Sent Events (SSE)
- **AI Providers**: OpenAI, Anthropic, Google AI (via BYOK)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Redis instance (Upstash recommended)
- AI provider API key (OpenAI/Anthropic/Google)

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/yourusername/authority13.git
cd authority13
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your configuration:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NEXTAUTH_SECRET`: Random secret (generate with \`openssl rand -base64 32\`)
- `MASTER_KEY`: Encryption key for API secrets (generate with \`openssl rand -base64 32\`)

4. Run database migrations:

\`\`\`bash
npx prisma migrate dev
\`\`\`

5. Seed the database with demo data:

\`\`\`bash
npm run db:seed
\`\`\`

6. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

7. In a separate terminal, start the worker:

\`\`\`bash
npm run worker
\`\`\`

8. Open [http://localhost:3000](http://localhost:3000)

### Demo Login

- **Email**: demo@authority13.ai
- **Password**: demo1234

## Project Structure

\`\`\`
authority13/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public pages (landing, pricing, about)
│   ├── (authenticated)/     # Protected app pages
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── mission-control/     # Mission Control UI
│   └── ...
├── lib/                     # Core utilities
│   ├── db.ts               # Prisma client
│   ├── redis.ts            # Redis client
│   ├── encryption.ts       # AES-256 encryption
│   ├── auth.ts             # NextAuth config
│   ├── workspace.ts        # Multi-tenant helpers
│   └── ...
├── packages/core/           # Agent Runtime
│   ├── agents/             # Agent implementations
│   ├── tools/              # Tool registry
│   ├── policy/             # Approval engine
│   └── runtime.ts          # Core orchestrator
├── workers/                # BullMQ workers
├── prisma/                 # Database schema & migrations
└── ...
\`\`\`

## Deployment

### Vercel (Frontend + API)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Worker (Railway/Render/Fly.io)

The BullMQ worker needs to run separately:

1. Create a new service on Railway/Render
2. Set the start command to: \`npm run worker\`
3. Add the same environment variables as Vercel
4. Deploy

### Database & Redis

- **PostgreSQL**: Use Supabase or Neon
- **Redis**: Use Upstash Redis

## Configuration

### BYOK (Bring Your Own Key)

1. Sign up and add your workspace
2. Navigate to Settings → API Keys
3. Add your OpenAI/Anthropic/Google API key
4. Keys are encrypted with AES-256-GCM

### Agents

All 5 agent types are created automatically:
- **Commander**: Plans and coordinates
- **Growth**: Marketing and outreach
- **Ops**: Operations and scheduling
- **Support**: Customer service
- **Analyst**: Data analysis and reporting

### Approvals

Configure approval policies in the workspace settings. By default, these actions require approval:
- Sending emails
- Webhook POST requests
- Generating payment links
- Creating calendar events
- Bulk database operations

## Development

### Running Tests

\`\`\`bash
# Coming soon
npm test
\`\`\`

### Database Migrations

\`\`\`bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
\`\`\`

### Prisma Studio

View and edit data:

\`\`\`bash
npx prisma studio
\`\`\`

## Security

- API keys encrypted at rest with AES-256-GCM
- Workspace isolation enforced at database level
- RBAC with 4 roles: admin, manager, operator, viewer
- Immutable audit log
- Rate limiting on all API endpoints
- Input validation with Zod

## Roadmap

- [ ] OAuth connector marketplace
- [ ] Advanced analytics dashboards
- [ ] Mobile app
- [ ] Video calls in Agent Boardroom
- [ ] Custom agent creation
- [ ] Workflow automation builder

## License

MIT License - see [LICENSE](LICENSE) for details

## Author

**Divindu Edirisinghe**  
AI Code Agency (Pvt) Ltd  
[Website](https://authority13.ai) | [Twitter](https://twitter.com/authority13)

## Support

- Email: support@authority13.ai
- Documentation: [docs.authority13.ai](https://docs.authority13.ai)
- Discord: [discord.gg/authority13](https://discord.gg/authority13)

---

Built with ❤️ using Next.js, Prisma, and AI.
