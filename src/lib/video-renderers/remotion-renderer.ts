/**
 * Remotion Video Renderer
 * High-quality React-based video generation
 * Context7 best practices: Optimized concurrency, webhook support, error handling
 */

import {
  renderMediaOnLambda,
  getRenderProgress,
  presignUrl,
  type AwsRegion,
} from "@remotion/lambda/client";
import type {
  VideoRenderer,
  RenderResult,
  RenderProgress,
  RenderType,
  RemotionConfig,
} from "./types";
import type { VideoDSL } from "@/lib/video-dsl";

// Map DSL to Remotion composition ID
function selectCompositionForDSL(dsl: VideoDSL): string {
  const isVertical = dsl.config.width < dsl.config.height;
  const durationSeconds =
    dsl.scenes.reduce((sum, s) => sum + s.duration, 0) / dsl.config.fps;

  if (isVertical && durationSeconds <= 20) {
    return "ViralAgentKitShort";
  }
  if (isVertical) {
    return "AgentKitShort";
  }

  const sceneTypes = dsl.scenes.map((s) => s.type);
  if (sceneTypes.includes("features") || sceneTypes.includes("stats")) {
    return "AgentKitProductVideo";
  }

  return "AgentKitHeroVideo";
}

// Convert DSL to Remotion input props
function dslToInputProps(dsl: VideoDSL): Record<string, unknown> {
  const heroScene = dsl.scenes.find((s) => s.type === "hero");
  const ctaScene = dsl.scenes.find((s) => s.type === "cta");
  const featuresScene = dsl.scenes.find((s) => s.type === "features");
  const statsScene = dsl.scenes.find((s) => s.type === "stats");

  return {
    productName: heroScene?.props?.title || "AgentKit",
    tagline: heroScene?.props?.subtitle || "Build AI agents in hours",
    primaryColor: dsl.theme.primaryColor,
    secondaryColor: dsl.theme.secondaryColor,
    backgroundColor: dsl.theme.backgroundColor,
    font: dsl.theme.font,
    features:
      featuresScene?.props?.items?.map((item) => ({
        icon: item.icon,
        title: item.text,
        description: "",
      })) || [],
    stats: statsScene?.props?.items || [],
    ctaHeadline: ctaScene?.props?.headline,
    ctaSubtext: ctaScene?.props?.subtext,
    ctaButtonText: ctaScene?.props?.buttonText,
    dsl,
  };
}

// Context7 best practice: Calculate optimal frames per lambda
// Based on Remotion's recommended interpolation formula
function calculateOptimalFramesPerLambda(totalFrames: number): number {
  // Between 0 and 10 minutes (at 30fps = 18000 frames), interpolate concurrency from 75 to 150
  const concurrency = Math.min(
    75 + (totalFrames / 18000) * 75,
    150
  );

  // At least 20 frames per lambda
  const framesPerLambda = Math.max(totalFrames / concurrency, 20);

  // Evenly distribute frames across lambdas
  const lambdasNeeded = Math.ceil(totalFrames / framesPerLambda);

  return Math.ceil(totalFrames / lambdasNeeded);
}

export class RemotionRenderer implements VideoRenderer {
  readonly name = "remotion";
  readonly supportsRealtimeProgress = true;

  private config: RemotionConfig;

  constructor(config: RemotionConfig) {
    this.config = config;
  }

  async render(options: {
    jobId: string;
    dsl: VideoDSL;
    type: RenderType;
  }): Promise<RenderResult> {
    const { jobId, dsl, type } = options;

    // Validate configuration
    if (!this.config.functionName) {
      return {
        success: false,
        jobId,
        provider: this.name,
        error: "REMOTION_AWS_FUNCTION_NAME not configured",
      };
    }

    if (!this.config.siteUrl) {
      return {
        success: false,
        jobId,
        provider: this.name,
        error: "REMOTION_SITE_URL not configured",
      };
    }

    try {
      const compositionId = selectCompositionForDSL(dsl);
      const totalFrames = dsl.scenes.reduce((sum, s) => sum + s.duration, 0);

      // Context7 best practice: Calculate optimal concurrency
      const framesPerLambda =
        type === "PREVIEW"
          ? Math.min(totalFrames, 30) // Fewer frames for short previews
          : calculateOptimalFramesPerLambda(totalFrames);

      // Calculate dimensions
      const forceWidth =
        type === "PREVIEW"
          ? Math.min(dsl.config.width, 854)
          : dsl.config.width;
      const forceHeight =
        type === "PREVIEW"
          ? Math.min(dsl.config.height, 480)
          : dsl.config.height;

      const inputProps = {
        ...dslToInputProps(dsl),
        _renderTimestamp: Date.now(),
        _jobId: jobId,
      };

      console.log(`[RemotionRenderer] Starting ${type} render for job ${jobId}`);
      console.log(`[RemotionRenderer] Composition: ${compositionId}`);
      console.log(`[RemotionRenderer] Resolution: ${forceWidth}x${forceHeight}`);
      console.log(`[RemotionRenderer] Frames: ${totalFrames}, FramesPerLambda: ${framesPerLambda}`);

      const result = await renderMediaOnLambda({
        region: this.config.region as AwsRegion,
        functionName: this.config.functionName,
        serveUrl: this.config.siteUrl,
        composition: compositionId,
        inputProps,
        codec: "h264",
        imageFormat: "jpeg",
        privacy: "public",
        forceWidth,
        forceHeight,
        forceDurationInFrames: totalFrames,
        framesPerLambda,
        maxRetries: 1,
        outName: `${type.toLowerCase()}.mp4`,
        downloadBehavior: { type: "play-in-browser" },
      });

      const { renderId, bucketName } = result;
      const objectKey = `renders/${renderId}/${type.toLowerCase()}.mp4`;

      console.log(`[RemotionRenderer] Render started: ${renderId}`);

      return {
        success: true,
        jobId,
        provider: this.name,
        externalId: renderId,
        outputUrl: `https://s3.${this.config.region}.amazonaws.com/${bucketName}/${objectKey}`,
        estimatedTimeSeconds: type === "PREVIEW" ? 30 : 180,
      };
    } catch (error) {
      console.error("[RemotionRenderer] Render failed:", error);
      return {
        success: false,
        jobId,
        provider: this.name,
        error: error instanceof Error ? error.message : "Failed to start render",
      };
    }
  }

  async getProgress(externalId: string): Promise<RenderProgress> {
    try {
      const progress = await getRenderProgress({
        region: this.config.region as AwsRegion,
        functionName: this.config.functionName,
        renderId: externalId,
        bucketName: this.getBucketNameFromRenderId(externalId),
      });

      if (progress.fatalErrorEncountered) {
        return {
          status: "FAILED",
          progress: Math.round(progress.overallProgress * 100),
          error: progress.errors.join("; "),
        };
      }

      if (progress.done) {
        return {
          status: "COMPLETED",
          progress: 100,
          outputUrl: progress.outputFile || undefined,
        };
      }

      return {
        status: "RENDERING",
        progress: Math.round(progress.overallProgress * 100),
      };
    } catch (error) {
      console.error("[RemotionRenderer] Get progress failed:", error);
      return {
        status: "FAILED",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate presigned URL for completed render
   */
  async getPresignedUrl(
    renderId: string,
    type: RenderType
  ): Promise<string | null> {
    try {
      const bucketName = this.getBucketNameFromRenderId(renderId);
      const objectKey = `renders/${renderId}/${type.toLowerCase()}.mp4`;

      const signedUrl = await presignUrl({
        region: this.config.region as AwsRegion,
        bucketName,
        objectKey,
        expiresInSeconds: 3600,
        checkIfObjectExists: true,
      });

      return signedUrl;
    } catch {
      return null;
    }
  }

  /**
   * Extract bucket name from renderId
   * Note: In production, you should store this mapping in your database
   */
  private getBucketNameFromRenderId(renderId: string): string {
    // This is a simplified approach - in production, store bucketName with the job
    // Remotion Lambda uses pattern: remotionlambda-{random}
    return `remotionlambda-${renderId.split("-")[0]}`;
  }
}
