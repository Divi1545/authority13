# CLAUDE.md — Authority13 (authority13)

## Owner
Divindu Edirisinghe — AI Code Agency Pvt Ltd, Sri Lanka

## What This Project Is
An AI Workforce Operating System (AIOS).
Businesses deploy AI agent teams — a Commander agent that breaks down objectives and delegates to specialist sub-agents (Growth, Ops, Support, Analyst).
Agents use real tools: web search, email, webhooks, file generation, data analysis.
This is also the AI layer that will run and automate all IslandLoaf operations.

## Tech Stack
- Framework: Next.js 14 (App Router)
- Database: PostgreSQL via Prisma
- Auth: NextAuth
- AI: Anthropic Claude API (claude-sonnet-4-6) — multi-agent system
- Real-time: Server-Sent Events (live streaming)
- Channels: Telegram, Discord, Slack, WhatsApp, Email
- Hosting: Vercel
- Domain: authority13.com

## Agent Architecture
- Commander Agent — receives objective, creates plan, delegates tasks
- Growth Agent — marketing, outreach, content
- Ops Agent — operations, scheduling, logistics
- Support Agent — customer service, responses
- Analyst Agent — data analysis, reporting, insights

## Pricing Tiers (Live)
- Starter: $49/month — 1 workspace, 2 agents
- Pro: $149/month — 5 agents, all channels, memory
- Business: $299/month — unlimited, white-label

## Environment Variables Required
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- ANTHROPIC_API_KEY
- TELEGRAM_BOT_TOKEN
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET

## IslandLoaf Integration (Key Priority)
Authority13 agents must automate:
- Vendor onboarding follow-up sequences
- Daily business intelligence brief (delivered via Telegram)
- Booking confirmation and follow-up emails
- Weekly vendor performance reports
- Marketing content generation for IslandLoaf Instagram

## Current Priorities
1. Keep live on Vercel, stable
2. Build IslandLoaf-specific agent workflows
3. Daily morning brief via Telegram for Divindu
4. Automate vendor onboarding pipeline
5. Grow paying customers ($49-$299/month)

## Rules for Claude
- Always use Anthropic Claude API (claude-sonnet-4-6), never OpenAI
- After completing any task, push changes to GitHub (Divi1545/authority13)
- Multi-agent responses must stream in real-time
- Human approval required for high-risk actions (emails, payments)
- Memory must persist across agent sessions
