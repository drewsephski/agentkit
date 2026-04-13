/**
 * Creatomate Video Renderer
 * Fast template-based video generation (~10s renders)
 * Verified working API: https://api.creatomate.com
 * 
 * Pricing: 50 free credits, starts at $41/mo
 * Speed: ~10 seconds for short videos
 */

import type {
  VideoRenderer,
  RenderResult,
  RenderProgress,
  RenderType,
} from "./types";
import type { VideoDSL, Scene } from "@/lib/video-dsl";

interface CreatomateConfig {
  apiKey: string;
  baseUrl?: string;
}

// Creatomate RenderScript format
interface CreatomateRenderRequest {
  output_format: "mp4";
  width: number;
  height: number;
  duration?: number;
  elements: CreatomateElement[];
}

type CreatomateElement =
  | {
      type: "text";
      text: string;
      font_family?: string;
      font_size?: string;
      fill_color?: string;
      background_color?: string;
      x?: string;
      y?: string;
      width?: string;
      height?: string;
      align?: "left" | "center" | "right";
    }
  | {
      type: "image";
      source: string;
      x?: string;
      y?: string;
      width?: string;
      height?: string;
    }
  | {
      type: "video";
      source: string;
      x?: string;
      y?: string;
      width?: string;
      height?: string;
    };

interface CreatomateRenderResponse {
  id: string;
  status: "processing" | "completed" | "failed";
  url?: string;
}

export class CreatomateRenderer implements VideoRenderer {
  readonly name = "creatomate";
  readonly supportsRealtimeProgress = false; // Requires polling

  private config: CreatomateConfig;

  constructor(config: CreatomateConfig) {
    this.config = {
      baseUrl: "https://api.creatomate.com/v2",
      ...config,
    };
  }

  /**
   * Convert VideoDSL to Creatomate RenderScript format
   */
  private dslToRenderScript(dsl: VideoDSL): CreatomateRenderRequest {
    const elements: CreatomateElement[] = [];

    // Add background
    elements.push({
      type: "image",
      source: this.generateBackgroundColor(dsl.theme.backgroundColor),
      x: "0%",
      y: "0%",
      width: "100%",
      height: "100%",
    });

    // Convert scenes to elements
    for (const scene of dsl.scenes) {
      const element = this.sceneToElement(scene, dsl);
      if (element) {
        elements.push(element);
      }
    }

    return {
      output_format: "mp4",
      width: dsl.config.width,
      height: dsl.config.height,
      elements,
    };
  }

  /**
   * Generate a solid color image URL
   */
  private generateBackgroundColor(color: string): string {
    // Use a data URI for solid color background
    // In production, you'd use a real image or Creatomate's color element
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="100%" height="100%" fill="${color}"/></svg>`
    )}`;
  }

  /**
   * Convert a scene to Creatomate element
   */
  private sceneToElement(scene: Scene, dsl: VideoDSL): CreatomateElement | null {
    switch (scene.type) {
      case "hero": {
        const props = scene.props as { title: string; subtitle?: string };
        return {
          type: "text",
          text: props.title,
          font_family: dsl.theme.font,
          font_size: "8vw",
          fill_color: "#ffffff",
          x: "50%",
          y: "50%",
          width: "90%",
          align: "center",
        };
      }

      case "text": {
        const props = scene.props as { text: string; align?: string };
        return {
          type: "text",
          text: props.text,
          font_family: dsl.theme.font,
          font_size: "4vw",
          fill_color: "#ffffff",
          x: "50%",
          y: "50%",
          width: "90%",
          align: (props.align as "left" | "center" | "right") || "center",
        };
      }

      case "cta": {
        const props = scene.props as { headline: string; subtext?: string };
        return {
          type: "text",
          text: props.headline,
          font_family: dsl.theme.font,
          font_size: "6vw",
          fill_color: dsl.theme.primaryColor,
          x: "50%",
          y: "50%",
          width: "90%",
          align: "center",
        };
      }

      default:
        return null;
    }
  }

  async render(options: {
    jobId: string;
    dsl: VideoDSL;
    type: RenderType;
  }): Promise<RenderResult> {
    const { jobId, dsl, type } = options;

    try {
      // For previews, reduce resolution
      const renderDSL: VideoDSL =
        type === "PREVIEW"
          ? {
              ...dsl,
              config: {
                ...dsl.config,
                width: 854,
                height: 480,
              },
            }
          : dsl;

      const renderScript = this.dslToRenderScript(renderDSL);

      const response = await fetch(`${this.config.baseUrl}/renders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(renderScript),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Creatomate API error: ${response.status} - ${error}`);
      }

      const data: CreatomateRenderResponse = await response.json();

      return {
        success: true,
        jobId,
        provider: this.name,
        externalId: data.id,
        estimatedTimeSeconds: type === "PREVIEW" ? 10 : 60,
      };
    } catch (error) {
      console.error("[CreatomateRenderer] Render failed:", error);
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
        `${this.config.baseUrl}/renders/${externalId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get progress: ${response.status}`);
      }

      const data: CreatomateRenderResponse = await response.json();

      // Map Creatomate status to unified status
      let status: RenderProgress["status"];
      let progress = 0;

      switch (data.status) {
        case "processing":
          status = "RENDERING";
          progress = 50; // Creatomate doesn't provide detailed progress
          break;
        case "completed":
          status = "COMPLETED";
          progress = 100;
          break;
        case "failed":
          status = "FAILED";
          break;
        default:
          status = "PENDING";
      }

      return {
        status,
        progress,
        outputUrl: data.url,
      };
    } catch (error) {
      console.error("[CreatomateRenderer] Get progress failed:", error);
      return {
        status: "FAILED",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
