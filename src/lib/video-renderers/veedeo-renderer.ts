/**
 * Veedeo Video Renderer
 * Fast GPU-accelerated video generation (2-5s renders)
 * Context7 best practices: Error handling, streaming, retry logic
 */

import type {
  VideoRenderer,
  RenderResult,
  RenderProgress,
  RenderType,
  VeedeoConfig,
} from "./types";
import type { VideoDSL, Scene } from "@/lib/video-dsl";

// Veedeo API types
interface VeedeoTimeline {
  duration_ms: number;
  tracks: VeedeoTrack[];
}

interface VeedeoTrack {
  id: string;
  type: "video" | "text" | "image" | "audio";
  clips: VeedeoClip[];
}

interface VeedeoClip {
  id: string;
  media_url?: string;
  start_time_ms: number;
  end_time_ms: number;
  properties?: {
    text?: string;
    font_family?: string;
    font_size?: number;
    color?: string;
    background_color?: string;
    align?: "left" | "center" | "right";
    opacity?: number;
    scale?: { x: number; y: number };
    position?: { x: number; y: number };
  };
}

interface VeedeoRenderRequest {
  version: "3.0";
  request_id: string;
  input: {
    timeline: VeedeoTimeline;
  };
  output: {
    resolution: { width: number; height: number };
    framerate: number;
    format: "mp4";
  };
}

interface VeedeoRenderResponse {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  output_url?: string;
  error?: string;
}

export class VeedeoRenderer implements VideoRenderer {
  readonly name = "veedeo";
  readonly supportsRealtimeProgress = true;

  private config: VeedeoConfig;

  constructor(config: VeedeoConfig) {
    this.config = {
      baseUrl: "https://api.veedeo.dev/v1",
      ...config,
    };
  }

  /**
   * Convert VideoDSL to Veedeo timeline format
   */
  private dslToTimeline(dsl: VideoDSL): VeedeoTimeline {
    const durationMs = dsl.scenes.reduce(
      (sum, scene) => sum + (scene.duration / dsl.config.fps) * 1000,
      0
    );

    const clips: VeedeoClip[] = [];
    let currentTimeMs = 0;

    for (const scene of dsl.scenes) {
      const sceneDurationMs = (scene.duration / dsl.config.fps) * 1000;
      const clip = this.sceneToClip(scene, currentTimeMs, sceneDurationMs, dsl);
      clips.push(clip);
      currentTimeMs += sceneDurationMs;
    }

    return {
      duration_ms: durationMs,
      tracks: [
        {
          id: "main",
          type: "video",
          clips,
        },
      ],
    };
  }

  /**
   * Convert a scene to a Veedeo clip
   */
  private sceneToClip(
    scene: Scene,
    startTimeMs: number,
    durationMs: number,
    dsl: VideoDSL
  ): VeedeoClip {
    const baseProps = {
      id: scene.id,
      start_time_ms: startTimeMs,
      end_time_ms: startTimeMs + durationMs,
    };

    switch (scene.type) {
      case "hero": {
        const props = scene.props as { title: string; subtitle?: string };
        return {
          ...baseProps,
          properties: {
            text: props.title,
            font_family: dsl.theme.font,
            font_size: 72,
            color: "#ffffff",
            background_color: dsl.theme.backgroundColor,
            align: "center",
          },
        };
      }

      case "text": {
        const props = scene.props as { text: string; align?: string };
        return {
          ...baseProps,
          properties: {
            text: props.text,
            font_family: dsl.theme.font,
            font_size: 32,
            color: "#ffffff",
            background_color: dsl.theme.backgroundColor,
            align: (props.align as "left" | "center" | "right") || "center",
          },
        };
      }

      case "cta": {
        const props = scene.props as { headline: string; subtext?: string };
        return {
          ...baseProps,
          properties: {
            text: props.headline,
            font_family: dsl.theme.font,
            font_size: 56,
            color: dsl.theme.primaryColor,
            background_color: dsl.theme.backgroundColor,
            align: "center",
          },
        };
      }

      default:
        // Fallback for unsupported scene types
        return {
          ...baseProps,
          properties: {
            text: "",
            font_family: dsl.theme.font,
            font_size: 24,
            color: "#ffffff",
            background_color: dsl.theme.backgroundColor,
            align: "center",
          },
        };
    }
  }

  async render(options: {
    jobId: string;
    dsl: VideoDSL;
    type: RenderType;
  }): Promise<RenderResult> {
    const { jobId, dsl, type } = options;

    try {
      // For previews, reduce resolution for speed
      const resolution =
        type === "PREVIEW"
          ? { width: 854, height: 480 }
          : { width: dsl.config.width, height: dsl.config.height };

      const timeline = this.dslToTimeline(dsl);

      const request: VeedeoRenderRequest = {
        version: "3.0",
        request_id: jobId,
        input: {
          timeline,
        },
        output: {
          resolution,
          framerate: dsl.config.fps,
          format: "mp4",
        },
      };

      // Context7 best practice: Implement retry logic
      const response = await this.fetchWithRetry(
        `${this.config.baseUrl}/render`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(request),
        }
      );

      const data: VeedeoRenderResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Veedeo API error: ${response.status}`);
      }

      return {
        success: true,
        jobId,
        provider: this.name,
        externalId: data.task_id,
        estimatedTimeSeconds: type === "PREVIEW" ? 5 : 30,
      };
    } catch (error) {
      console.error("[VeedeoRenderer] Render failed:", error);
      return {
        success: false,
        jobId,
        provider: this.name,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getProgress(externalId: string): Promise<RenderProgress> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/render/${externalId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get progress: ${response.status}`);
      }

      const data: VeedeoRenderResponse = await response.json();

      return {
        status: this.mapStatus(data.status),
        progress: data.progress ?? 0,
        outputUrl: data.output_url,
        error: data.error,
      };
    } catch (error) {
      console.error("[VeedeoRenderer] Get progress failed:", error);
      return {
        status: "FAILED",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Context7 best practice: Map provider-specific status to unified status
   */
  private mapStatus(
    veedeoStatus: VeedeoRenderResponse["status"]
  ): RenderProgress["status"] {
    switch (veedeoStatus) {
      case "pending":
        return "PENDING";
      case "processing":
        return "RENDERING";
      case "completed":
        return "COMPLETED";
      case "failed":
        return "FAILED";
      default:
        return "PENDING";
    }
  }

  /**
   * Context7 best practice: Retry logic with exponential backoff
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3
  ): Promise<Response> {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        if (response.ok) {
          return response;
        }

        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on last attempt
        if (i < retries - 1) {
          const delay = Math.min(1000 * Math.pow(2, i), 8000); // Exponential backoff, max 8s
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}
