<div align="center">
  
![AgentKit](public/agent-template-og.png)

# AgentKit

**The complete AI agent platform. Build, deploy, and scale intelligent agents with voice, video, and real-time capabilities.**

From prototype to production in hours—not months. AgentKit gives you everything: multi-modal AI agents, automated video generation, web search, authentication, and a beautiful chat interface.

[Live Demo](https://agentkit-demo.vercel.app) · [Quick Start](#quick-start) · [Features](#features)

</div>

---

## Features

<table>
<tr>
<td width="50%">

![Web Search](public/feature-web-search.svg)

**AI-Powered Web Search**
Real-time web search with source citations. Your agents access current information, news, and data—beyond training cutoffs.

</td>
<td width="50%">

![Chat](public/feature-chat-interface.svg)

**Modern Chat Interface**
Streaming responses, file uploads, tool call visualization, and multi-agent conversations with persistent history.

</td>
</tr>
<tr>
<td width="50%">

🎬 **AI Video Generation**

Generate promotional videos, product demos, and social content automatically. Remotion Lambda + Creatomate integration for scalable video rendering.

</td>
<td width="50%">

![Auth](public/feature-authentication.svg)

**Secure Authentication**
Clerk-powered auth with email/password, OAuth, and organization support. Enterprise-ready security out of the box.

</td>
</tr>
<tr>
<td width="50%">

![Developer](public/feature-developers.svg)

**Developer First**
TypeScript, Prisma, clean architecture. Extensible tool system for adding custom agent capabilities.

</td>
<td width="50%">

⚡ **Production Ready**

Error handling, loading states, responsive design, and Vercel-optimized. Stripe integration for monetization built-in.

</td>
</tr>
</table>

## Quick Start

```bash
# Clone
git clone https://github.com/drewsephski/agentkit.git
cd agentkit

# Install
bun install

# Setup env
cp .env.example .env.local
# Add your API keys

# Database
bun prisma migrate dev

# Start
bun dev
```

Open [localhost:3000](http://localhost:3000)

## Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![Remotion](https://img.shields.io/badge/Remotion-Video-1D4ED8?style=flat-square)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)

## Environment

```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ANTHROPIC_API_KEY=
DATABASE_URL=

# Video Generation (Optional)
REMOTION_AWS_FUNCTION_NAME=      # Lambda function for rendering
REMOTION_SITE_URL=               # Remotion site deployment URL
CREATOMATE_API_KEY=              # Alternative video renderer

# Payments (Optional)
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Video Generation

AgentKit includes a powerful video generation system for creating promotional content automatically:

```bash
# Deploy Remotion Lambda for video rendering
npx remotion lambda functions deploy --timeout=300

# Create your site
npx remotion lambda sites create
```

**Supported Video Types:**
- Product promos with animated scenes
- Social media shorts (TikTok/Reels format)
- Hero videos for landing pages
- Feature showcases with dynamic content

## Scripts

| Command | Description |
| :------ | :---------- |
| `bun dev` | Start dev server |
| `bun build` | Production build |
| `bun lint` | Run Biome linter |
| `bun format` | Format code |
| `bun prisma migrate dev` | Run migrations |

## Structure

```
app/                    # Next.js App Router
├── api/                # API routes (chat, webhooks)
├── chat/               # Chat interface pages
agents/                 # AI agents
├── web-search-agent/   # Search-enabled agent
│   ├── agent.ts
│   ├── prompt.ts
│   └── tools.ts
├── video-agent/        # Video generation agent
│   └── tools.ts        # Remotion + Creatomate tools
components/
├── chat-ui/            # Chat components
├── sections/           # Landing page sections
└── ui/                 # shadcn/ui components
lib/
├── video-renderers/    # Video rendering providers
│   ├── remotion-renderer.ts
│   ├── creatomate-renderer.ts
│   └── factory.ts
├── prisma.ts           # Database client
└── stripe.ts           # Payment integration
prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations
public/                 # Static assets + videos
```

## License

MIT · Built with ❤️ using [AgentKit](https://github.com/drewsephski/agentkit)
