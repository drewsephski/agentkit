/**
 * Video Renderer Factory
 * Provider pattern for swappable video rendering implementations
 * Context7 best practices: Clean architecture, dependency injection
 */

import type { VideoRenderer } from "./types";
import { VeedeoRenderer } from "./veedeo-renderer";
import { RemotionRenderer } from "./remotion-renderer";
import { CreatomateRenderer } from "./creatomate-renderer";

export type RendererType = "veedeo" | "remotion" | "creatomate" | "auto";

interface RendererRegistry {
  veedeo?: VeedeoRenderer;
  remotion?: RemotionRenderer;
  creatomate?: CreatomateRenderer;
}

class RendererFactory {
  private registry: RendererRegistry = {};

  /**
   * Initialize renderers from environment configuration
   * Context7 best practice: Lazy initialization with validation
   */
  initialize(): void {
    // Initialize Veedeo if API key is available
    if (process.env.VEEDEO_API_KEY) {
      this.registry.veedeo = new VeedeoRenderer({
        apiKey: process.env.VEEDEO_API_KEY,
        baseUrl: process.env.VEEDEO_BASE_URL,
      });
      console.log("[RendererFactory] Veedeo renderer initialized");
    }

    // Initialize Remotion if configuration is available
    if (process.env.REMOTION_AWS_FUNCTION_NAME && process.env.REMOTION_SITE_URL) {
      this.registry.remotion = new RemotionRenderer({
        region: process.env.REMOTION_AWS_REGION || "us-east-1",
        functionName: process.env.REMOTION_AWS_FUNCTION_NAME,
        siteUrl: process.env.REMOTION_SITE_URL,
      });
      console.log("[RendererFactory] Remotion renderer initialized");
    }

    // Initialize Creatomate if API key is available
    if (process.env.CREATOMATE_API_KEY) {
      this.registry.creatomate = new CreatomateRenderer({
        apiKey: process.env.CREATOMATE_API_KEY,
      });
      console.log("[RendererFactory] Creatomate renderer initialized");
    }
  }

  /**
   * Get renderer by type
   */
  getRenderer(type: RendererType): VideoRenderer | null {
    if (type === "auto") {
      return this.getAutoRenderer();
    }
    return this.registry[type] || null;
  }

  /**
   * Auto-select best available renderer
   * Priority: Veedeo (fast) > Remotion (quality)
   */
  private getAutoRenderer(): VideoRenderer | null {
    return this.registry.veedeo || this.registry.remotion || null;
  }

  /**
   * Get renderer optimized for render type
   * PREVIEW: Veedeo (2-5s renders)
   * FINAL: Remotion (high quality)
   */
  getRendererForType(
    renderType: "PREVIEW" | "FINAL",
    preference?: RendererType
  ): VideoRenderer | null {
    // If specific preference provided and available, use it
    if (preference && preference !== "auto") {
      return this.getRenderer(preference);
    }

    // Auto-selection based on render type
    if (renderType === "PREVIEW") {
      // For previews, prefer Veedeo for speed
      return this.registry.veedeo || this.registry.remotion || null;
    }

    // For final renders, prefer Remotion for quality
    return this.registry.remotion || this.registry.veedeo || null;
  }

  /**
   * Check if specific renderer is available
   */
  isAvailable(type: RendererType): boolean {
    if (type === "auto") {
      return this.registry.veedeo !== undefined || this.registry.remotion !== undefined;
    }
    return this.registry[type] !== undefined;
  }

  /**
   * Get list of available renderers
   */
  getAvailableRenderers(): string[] {
    return Object.keys(this.registry);
  }
}

// Export singleton instance
export const rendererFactory = new RendererFactory();
