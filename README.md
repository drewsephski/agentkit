<div align="center">
  
![AgentKit](public/agent-template-og.png)

# AgentKit

**Build AI agents in hours, not weeks.**

A production-ready starter for AI-powered chat applications with web search, authentication, and beautiful UI.

[Live Demo](https://agentkit-demo.vercel.app) · [Quick Start](#quick-start) · [Documentation](#docs)

</div>

---

## Features

<table>
<tr>
<td width="50%">

![Web Search](public/feature-web-search.svg)

**AI-Powered Web Search**
Real-time web search with source citations. Toggle on/off instantly.

</td>
<td width="50%">

![Chat](public/feature-chat-interface.svg)

**Modern Chat Interface**
Streaming responses, file uploads, and tool call visualization.

</td>
</tr>
<tr>
<td width="50%">

![Auth](public/feature-authentication.svg)

**Secure Authentication**
Clerk-powered auth with email/password and OAuth support.

</td>
<td width="50%">

![Developer](public/feature-developers.svg)

**Developer First**
TypeScript, Prisma, clean architecture, easy to customize.

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

## Environment

```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ANTHROPIC_API_KEY=
DATABASE_URL=

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun build` | Production build |
| `bun lint` | Run Biome linter |
| `bun format` | Format code |
| `bun prisma migrate dev` | Run migrations |

## Structure

```
app/           # Next.js App Router
agents/        # AI agent implementations
components/    # React + shadcn/ui
lib/           # Utilities
prisma/        # Database schema
public/        # Assets + videos
```

## License

MIT · Built with ❤️ using [AgentKit](https://github.com/drewsephski/agentkit)
