import { z } from "zod";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { validateVideoDSL, type VideoDSL } from "@/lib/video-dsl";
import type { ToolSet } from "ai";
import { renderMediaOnLambda, getRenderProgress, presignUrl, type AwsRegion } from "@remotion/lambda/client";

// Configuration for Remotion Lambda - these should be set in environment variables
const REMOTION_REGION = (process.env.REMOTION_AWS_REGION || "us-east-1") as AwsRegion;
const REMOTION_FUNCTION_NAME = process.env.REMOTION_AWS_FUNCTION_NAME;
const REMOTION_SITE_URL = process.env.REMOTION_SITE_URL;

/**
 * Maps a VideoDSL to the appropriate Remotion composition ID based on content
 */
function selectCompositionForDSL(dsl: VideoDSL): string {
  const sceneTypes = dsl.scenes.map((s) => s.type);
  const isVertical = dsl.config.width < dsl.config.height;
  const durationSeconds = dsl.scenes.reduce((sum, s) => sum + s.duration, 0) / dsl.config.fps;

  // Short-form vertical video (under 20 seconds, 9:16 aspect ratio)
  if (isVertical && durationSeconds <= 20) {
    return "ViralAgentKitShort";
  }

  // Vertical video (any length, 9:16 aspect ratio)
  if (isVertical) {
    return "AgentKitShort";
  }

  // Product video with multiple scene types
  if (sceneTypes.includes("features") || sceneTypes.includes("stats")) {
    return "AgentKitProductVideo";
  }

  // Default to hero video for simple single-scene or hero-focused content
  return "AgentKitHeroVideo";
}

/**
 * Converts VideoDSL to input props for Remotion compositions
 */
function dslToInputProps(dsl: VideoDSL): Record<string, unknown> {
  // Extract content from scenes
  const heroScene = dsl.scenes.find((s) => s.type === "hero");
  const ctaScene = dsl.scenes.find((s) => s.type === "cta");
  const featuresScene = dsl.scenes.find((s) => s.type === "features");
  const statsScene = dsl.scenes.find((s) => s.type === "stats");

  return {
    // Core content from hero scene or defaults
    productName: heroScene?.props?.title || "AgentKit",
    tagline: heroScene?.props?.subtitle || "Build AI agents in hours, not weeks",

    // Theme colors
    primaryColor: dsl.theme.primaryColor,
    secondaryColor: dsl.theme.secondaryColor,
    backgroundColor: dsl.theme.backgroundColor,
    font: dsl.theme.font,

    // Features (if available) - map DSL 'text' field to composition 'title' field
    features: featuresScene?.props?.items?.map(item => ({
      icon: item.icon,
      title: item.text,
      description: "",
    })) || [],

    // Stats (if available)
    stats: statsScene?.props?.items || [],

    // CTA content
    ctaHeadline: ctaScene?.props?.headline,
    ctaSubtext: ctaScene?.props?.subtext,
    ctaButtonText: ctaScene?.props?.buttonText,

    // Full DSL for custom rendering
    dsl,
  };
}

/**
 * Renders a video using Remotion Lambda
 */
async function renderVideoOnLambda(options: {
  jobId: string;
  dsl: VideoDSL;
  type: "PREVIEW" | "FINAL";
}): Promise<{ success: boolean; url?: string; error?: string; renderId?: string; bucketName?: string; outKey?: string }> {
  // Validate configuration
  if (!REMOTION_FUNCTION_NAME) {
    return {
      success: false,
      error: "REMOTION_AWS_FUNCTION_NAME not configured. Run 'npx remotion lambda functions deploy' and set the function name.",
    };
  }

  if (!REMOTION_SITE_URL) {
    return {
      success: false,
      error: "REMOTION_SITE_URL not configured. Run 'npx remotion lambda sites create' and set the serve URL.",
    };
  }

  try {
    // Select appropriate composition and convert DSL to props
    const compositionId = selectCompositionForDSL(options.dsl);
    const inputProps = {
      ...dslToInputProps(options.dsl),
      // Add unique timestamp to prevent any caching
      _renderTimestamp: Date.now(),
      _jobId: options.jobId,
    };

    // Calculate dimensions - for preview, use lower resolution
    const forceWidth = options.type === "PREVIEW" ? Math.min(options.dsl.config.width, 854) : options.dsl.config.width;
    const forceHeight = options.type === "PREVIEW" ? Math.min(options.dsl.config.height, 480) : options.dsl.config.height;

    // Calculate frames per lambda based on video length (optimize for parallel rendering)
    // Context7 best practice: More lambdas = faster rendering (diminishing returns after ~100)
    const totalFrames = options.dsl.scenes.reduce((sum, s) => sum + s.duration, 0);
    
    // For previews: Use fewer frames per lambda for faster completion (avoid timeout)
    // For final: Balance speed vs cost
    const framesPerLambda = options.type === "PREVIEW" 
      ? Math.min(30, Math.max(Math.floor(totalFrames / 10), 10)) // ~10 lambdas for previews (faster)
      : Math.max(Math.floor(totalFrames / 50), 20); // ~50 lambdas for final

    console.log(`[Video Render] Starting ${options.type} render for job ${options.jobId}`);
    console.log(`[Video Render] Composition: ${compositionId}, Resolution: ${forceWidth}x${forceHeight}`);
    console.log(`[Video Render] Input props productName: ${inputProps.productName}`);
    console.log(`[Video Render] Input props tagline: ${inputProps.tagline}`);
    console.log(`[Video Render] Features count: ${inputProps.features?.length || 0}`);

    // Trigger the Lambda render
    const renderResult = await renderMediaOnLambda({
      region: REMOTION_REGION,
      functionName: REMOTION_FUNCTION_NAME,
      serveUrl: REMOTION_SITE_URL,
      composition: compositionId,
      inputProps,
      codec: "h264",
      imageFormat: "jpeg",
      privacy: "public",
      forceWidth,
      forceHeight,
      forceDurationInFrames: totalFrames,
      framesPerLambda,
      concurrency: options.type === "PREVIEW" ? 50 : undefined, // Force high concurrency for previews
      maxRetries: 1,
      outName: `${options.type.toLowerCase()}.mp4`,
      downloadBehavior: { type: "play-in-browser" },
    });

    // Debug: Log full render result to understand the actual S3 path
    console.log("[Video Render] Full render result:", JSON.stringify(renderResult, null, 2));
    
    // Check if render actually succeeded
    if (!renderResult.renderId || !renderResult.bucketName) {
      console.error("[Video Render] Render failed - missing renderId or bucketName");
      return {
        success: false,
        error: "Render failed to start - check Lambda function configuration and timeout",
      };
    }

    // Extract values from render result
    const { renderId, bucketName } = renderResult;

    // Remotion stores files in renders/{renderId}/ folder, not renders/{jobId}/
    // The outName we passed becomes the filename within that folder
    const objectKey = `renders/${renderId}/${options.type.toLowerCase()}.mp4`;

    // Construct the output URL
    const outputUrl = `https://s3.${REMOTION_REGION}.amazonaws.com/${bucketName}/${objectKey}`;

    console.log(`[Video Render] Started render ${renderId} in bucket ${bucketName}, key: ${objectKey}`);

    return {
      success: true,
      renderId,
      bucketName,
      url: outputUrl,
      outKey: objectKey,
    };
  } catch (error) {
    console.error("[Video Render] Lambda render failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start video render on Lambda",
    };
  }
}

// Tool definitions factory - creates tools with injected userId and chatId
export function createVideoAgentTools(userId: string, chatId: string): ToolSet {
  return {
    createProject: {
      description: "Create a new video project with the specified DSL. Validates the DSL structure and saves to database. Mode: TEMPLATE or CREATIVE. DSL: Video DSL object with scenes, theme, config.",
      inputSchema: z.object({
        mode: z.enum(["TEMPLATE", "CREATIVE"]),
        dsl: z.record(z.string(), z.any()),
      }),
      execute: async (input) => {
        const { mode, dsl } = input;
      // Validate the DSL
      const validation = validateVideoDSL(dsl);
      if (!validation.success) {
        return {
          success: false,
          error: "Invalid Video DSL",
          details: validation.errors,
        };
      }

      try {
        // Log the DSL being saved
        const heroScene = validation.data.scenes.find(s => s.type === "hero");
        console.log(`[Video Project] Creating project with hero title: ${heroScene?.props?.title || 'N/A'}`);
        console.log(`[Video Project] Scenes: ${validation.data.scenes.map(s => s.type).join(', ')}`);

        // Create the project in database
        const project = await prisma.videoProject.create({
          data: {
            userId,
            chatId,
            mode,
            dsl: validation.data as Prisma.InputJsonValue,
          },
        });

        const duration = validation.data.scenes.reduce((sum, scene) => sum + scene.duration, 0) / validation.data.config.fps;

        return {
          success: true,
          projectId: project.id,
          message: `Video project created with ${validation.data.scenes.length} scenes (~${Math.round(duration)}s). Ready to preview!`,
          summary: {
            scenes: validation.data.scenes.map((s) => ({ id: s.id, type: s.type, duration: s.duration })),
            theme: validation.data.theme,
            totalDuration: `${Math.round(duration)} seconds`,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to create project",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  },

  updateProject: {
    description: "Update an existing video project with a new DSL. Use this to modify scenes, theme, or config.",
    inputSchema: z.object({
      projectId: z.string(),
      dsl: z.record(z.string(), z.any()),
    }),
    execute: async (input) => {
      const { projectId, dsl } = input;
      // Validate the DSL
      const validation = validateVideoDSL(dsl);
      if (!validation.success) {
        return {
          success: false,
          error: "Invalid Video DSL",
          details: validation.errors,
        };
      }

      try {
        // Update the project
        const project = await prisma.videoProject.update({
          where: { id: projectId },
          data: {
            dsl: validation.data as Prisma.InputJsonValue,
            updatedAt: new Date(),
          },
        });

        const duration = validation.data.scenes.reduce((sum, scene) => sum + scene.duration, 0) / validation.data.config.fps;

        return {
          success: true,
          projectId: project.id,
          message: `Project updated! Now has ${validation.data.scenes.length} scenes (~${Math.round(duration)}s).`,
          summary: {
            scenes: validation.data.scenes.map((s) => ({ id: s.id, type: s.type, duration: s.duration })),
            totalDuration: `${Math.round(duration)} seconds`,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to update project",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  },

  renderPreview: {
    description: "Generate a low-resolution preview video (480p, 5-10 seconds). Fast and good for iteration.",
    inputSchema: z.object({
      projectId: z.string(),
    }),
    execute: async (input) => {
      const { projectId } = input;
      try {
        // Get the project
        const project = await prisma.videoProject.findUnique({
          where: { id: projectId },
        });

        if (!project) {
          return {
            success: false,
            error: "Project not found",
          };
        }

        // Create preview DSL (truncated, lower res)
        const fullDSL = project.dsl as unknown as VideoDSL;
        console.log(`[Video Render] Project DSL scenes: ${fullDSL.scenes.map(s => {
          const props = s.props as Record<string, unknown>;
          const label = (props?.title as string) || (props?.headline as string) || (props?.text as string) || '-';
          return `${s.type}:${label}`.substring(0, 40);
        }).join(', ')}`);

        const previewDSL: VideoDSL = {
          ...fullDSL,
          scenes: fullDSL.scenes.slice(0, 3).map((scene) => ({
            ...scene,
            duration: Math.min(scene.duration, 90), // Max 3 seconds per scene in preview
          })),
          config: {
            ...fullDSL.config,
            width: 854,
            height: 480,
          },
        };

        // Create render job
        const job = await prisma.videoJob.create({
          data: {
            projectId,
            type: "PREVIEW",
            status: "PENDING",
            progress: 0,
          },
        });

        // Trigger Lambda render
        const renderResult = await renderVideoOnLambda({
          jobId: job.id,
          dsl: previewDSL,
          type: "PREVIEW",
        });

        if (!renderResult.success) {
          await prisma.videoJob.update({
            where: { id: job.id },
            data: { status: "FAILED", error: renderResult.error },
          });
          return {
            success: false,
            error: renderResult.error,
          };
        }

        // Update job with render info
        await prisma.videoJob.update({
          where: { id: job.id },
          data: {
            status: "RENDERING",
            outputUrl: renderResult.url,
            renderId: renderResult.renderId,
            bucketName: renderResult.bucketName,
            outKey: renderResult.outKey,
          },
        });

        return {
          success: true,
          jobId: job.id,
          message: "🎬 Preview rendering started! This will take 10-30 seconds.",
          statusUrl: `/api/video/status/${job.id}`,
          estimatedTime: "10-30 seconds",
        };
      } catch (error) {
        console.error("[Video Render] Error in renderPreview:", error);
        return {
          success: false,
          error: "Failed to start preview render",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  },

  renderFinal: {
    description: "Render the final high-quality video (1080p+). Takes longer but produces production-ready output.",
    inputSchema: z.object({
      projectId: z.string(),
    }),
    execute: async (input) => {
      const { projectId } = input;
      try {
        // Get the project
        const project = await prisma.videoProject.findUnique({
          where: { id: projectId },
          include: { jobs: { where: { type: "FINAL", status: { not: "FAILED" } } } },
        });

        if (!project) {
          return {
            success: false,
            error: "Project not found",
          };
        }

        // Check if already rendering
        const existingJob = project.jobs.find((j) => j.status === "PENDING" || j.status === "RENDERING");
        if (existingJob) {
          return {
            success: false,
            error: "Already rendering final video",
            jobId: existingJob.id,
            message: "A final render is already in progress. Check status with getRenderStatus.",
          };
        }

        const dsl = project.dsl as unknown as VideoDSL;
        const duration = dsl.scenes.reduce((sum, scene) => sum + scene.duration, 0) / dsl.config.fps;

        // Create render job
        const job = await prisma.videoJob.create({
          data: {
            projectId,
            type: "FINAL",
            status: "PENDING",
            progress: 0,
          },
        });

        // Trigger Lambda render
        const renderResult = await renderVideoOnLambda({
          jobId: job.id,
          dsl,
          type: "FINAL",
        });

        if (!renderResult.success) {
          await prisma.videoJob.update({
            where: { id: job.id },
            data: { status: "FAILED", error: renderResult.error },
          });
          return {
            success: false,
            error: renderResult.error,
          };
        }

        // Update job
        await prisma.videoJob.update({
          where: { id: job.id },
          data: {
            status: "RENDERING",
            outputUrl: renderResult.url,
            renderId: renderResult.renderId,
            bucketName: renderResult.bucketName,
            outKey: renderResult.outKey,
          },
        });

        const estimatedMinutes = Math.ceil(duration / 60);

        return {
          success: true,
          jobId: job.id,
          message: `🎬 Final render started! Estimated time: ${estimatedMinutes} minute${estimatedMinutes > 1 ? "s" : ""}.`,
          statusUrl: `/api/video/status/${job.id}`,
          estimatedTime: `${estimatedMinutes} minutes`,
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to start final render",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  },

  getRenderStatus: {
    description: "Check the current status of a video render job (preview or final). Returns progress percentage and download URL when complete.",
    inputSchema: z.object({
      jobId: z.string(),
    }),
    execute: async (input) => {
      const { jobId } = input;
      try {
        const job = await prisma.videoJob.findUnique({
          where: { id: jobId },
          include: { project: true },
        });

        if (!job) {
          return {
            success: false,
            error: "Job not found",
          };
        }

        // If rendering, poll Lambda for actual progress
        let currentProgress = job.progress;
        let currentStatus = job.status;
        let renderErrors = job.error;

        if (job.status === "RENDERING" && job.renderId && job.bucketName) {
          try {
            const progress = await getRenderProgress({
              region: REMOTION_REGION,
              functionName: REMOTION_FUNCTION_NAME || "",
              renderId: job.renderId,
              bucketName: job.bucketName,
            });

            // Update progress (overallProgress is 0-1)
            currentProgress = Math.round(progress.overallProgress * 100);

            // Check if render is complete
            if (progress.done) {
              currentStatus = "COMPLETED";
              currentProgress = 100;
              await prisma.videoJob.update({
                where: { id: jobId },
                data: {
                  status: "COMPLETED",
                  progress: 100,
                  completedAt: new Date(),
                  outputUrl: progress.outputFile || job.outputUrl,
                },
              });
            } else if (progress.fatalErrorEncountered) {
              currentStatus = "FAILED";
              renderErrors = progress.errors.map((e: unknown) => 
                typeof e === 'string' ? e : JSON.stringify(e)
              ).join("; ");
              await prisma.videoJob.update({
                where: { id: jobId },
                data: {
                  status: "FAILED",
                  error: renderErrors,
                  progress: currentProgress,
                },
              });
            } else {
              // Still rendering - update progress
              await prisma.videoJob.update({
                where: { id: jobId },
                data: { progress: currentProgress },
              });
            }
          } catch (pollError) {
            console.error("[Video Render] Error polling progress:", pollError);
            // Don't fail - return cached status
          }
        }

        // Generate presigned URL if completed
        let downloadUrl: string | null = null;
        if (currentStatus === "COMPLETED" && job.bucketName) {
          try {
            // Use the actual S3 key from Remotion if available, otherwise construct it using renderId
            const objectKey = job.outKey || (job.renderId ? `renders/${job.renderId}/${job.type.toLowerCase()}.mp4` : null);
            if (!objectKey) {
              downloadUrl = `/api/video/download/${job.id}`;
            } else {
              const signedUrl = await presignUrl({
                region: REMOTION_REGION,
                bucketName: job.bucketName,
                objectKey,
                expiresInSeconds: 3600, // 1 hour
                checkIfObjectExists: true,
              });
              downloadUrl = signedUrl || `/api/video/download/${job.id}`;
            }
          } catch {
            downloadUrl = `/api/video/download/${job.id}`;
          }
        }

        const statusMessages: Record<string, string> = {
          PENDING: "⏳ Queued and waiting to start...",
          RENDERING: `🎬 Rendering in progress (${Math.round(currentProgress)}%)...`,
          COMPLETED: "✅ Render complete! Video ready for download.",
          FAILED: `❌ Render failed: ${renderErrors || "Unknown error"}`,
        };

        const outputUrl = currentStatus === "COMPLETED" ? downloadUrl : null;

        const result = {
          success: true,
          jobId: job.id,
          status: currentStatus,
          progress: currentProgress,
          type: job.type,
          message: statusMessages[currentStatus],
          outputUrl,
          downloadUrl,
          completedAt: job.completedAt,
        };
        console.log(`[Video Render] getRenderStatus result for job ${jobId}:`, JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.error(`[Video Render] Error in getRenderStatus for job ${jobId}:`, error);
        return {
          success: false,
          error: "Failed to get render status",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  }
};
}
