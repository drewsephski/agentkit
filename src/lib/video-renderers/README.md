# Video Rendering Architecture

This module implements a **provider pattern** for video rendering, allowing you to swap between different rendering backends based on your needs.

## Providers

### 1. Veedeo (Fast GPU Rendering)
- **Best for:** Preview generation
- **Render time:** 2-5 seconds for 15s videos
- **Pricing:** $0.01/second ($0.15 for 15s video)
- **Free tier:** 300 credits/day (5 minutes)

**Setup:**
```bash
# Add to .env.local
VEEDEO_API_KEY=your_api_key
```

### 2. Remotion Lambda (High Quality)
- **Best for:** Final production renders
- **Render time:** 10-30 seconds for previews, 1-5 min for final
- **Pricing:** AWS Lambda costs (~$0.01/minute)
- **Features:** React-based, complex animations, transitions

**Setup:**
```bash
# Deploy Remotion Lambda
npx remotion lambda functions deploy
npx remotion lambda sites create

# Add to .env.local
REMOTION_AWS_FUNCTION_NAME=remotion-render-xxxxx
REMOTION_SITE_URL=https://xxxxx.s3.amazonaws.com/sites/xxxxx
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Video Agent Tools                      │
│  (createProject, renderPreview, renderFinal, etc.)       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Renderer Factory (factory.ts)               │
│  - Auto-initializes available renderers                 │
│  - Routes requests to optimal provider                  │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
┌─────────────────────┐      ┌─────────────────────┐
│   VeedeoRenderer    │      │  RemotionRenderer   │
│   (veedeo-renderer) │      │  (remotion-renderer)│
│                     │      │                     │
│  - GPU accelerated  │      │  - React-based      │
│  - JSON templates   │      │  - Lambda parallel  │
│  - 2-5s renders     │      │  - High quality     │
└─────────────────────┘      └─────────────────────┘
```

## Usage

### Auto-Select (Recommended)

The system automatically selects the best provider:
- **Previews:** Uses Veedeo (fast) if available, falls back to Remotion
- **Final renders:** Uses Remotion (quality) if available, falls back to Veedeo

```typescript
import { createVideoAgentTools } from "@/agents/video-agent/tools-refactored";

const tools = createVideoAgentTools(userId, chatId);

// Automatically selects optimal provider
await tools.renderPreview.execute({ projectId: "xxx", provider: "auto" });
await tools.renderFinal.execute({ projectId: "xxx", provider: "auto" });
```

### Force Specific Provider

```typescript
// Force Veedeo for preview
await tools.renderPreview.execute({ projectId: "xxx", provider: "veedeo" });

// Force Remotion for final
await tools.renderFinal.execute({ projectId: "xxx", provider: "remotion" });
```

## Adding a New Provider

1. Create a new renderer class implementing `VideoRenderer` interface:

```typescript
import type { VideoRenderer, RenderResult, RenderProgress } from "./types";

export class MyCustomRenderer implements VideoRenderer {
  readonly name = "mycustom";
  readonly supportsRealtimeProgress = true;

  async render(options: {
    jobId: string;
    dsl: VideoDSL;
    type: RenderType;
  }): Promise<RenderResult> {
    // Implementation
  }

  async getProgress(externalId: string): Promise<RenderProgress> {
    // Implementation
  }
}
```

2. Register in `factory.ts`:

```typescript
// In rendererFactory.initialize()
if (process.env.MYCUSTOM_API_KEY) {
  this.registry.mycustom = new MyCustomRenderer(config);
}
```

3. Update Prisma schema (if adding new fields):

```prisma
model VideoJob {
  // ... existing fields
  provider String? // Now supports 'veedeo', 'remotion', 'mycustom'
}
```

## Webhooks

### Veedeo Webhook

Configure Veedeo to POST to:
```
POST /api/video/webhook/veedeo
```

Receives real-time progress updates without polling.

### Remotion Webhook

Configure Remotion Lambda with webhook URL:
```
POST /api/video/webhook/remotion
```

## Context7 Best Practices Applied

1. **Provider Pattern:** Clean separation of concerns, swappable implementations
2. **Factory Pattern:** Centralized initialization and selection logic
3. **Error Handling:** Comprehensive try-catch with retry logic
4. **Type Safety:** Full TypeScript coverage with strict interfaces
5. **API Design:** Unified interface across all providers
6. **Streaming:** Support for real-time progress updates
7. **Exponential Backoff:** Retry logic with sensible delays
