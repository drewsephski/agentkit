/**
 * Refactored Video Agent Tools
 * Uses provider pattern for swappable video rendering
 * Context7 best practices: Clean architecture, error handling, streaming
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { validateVideoDSL, type VideoDSL } from "@/lib/video-dsl";
import { rendererFactory, type RendererType } from "@/lib/video-renderers";
import type { ToolSet } from "ai";

// Initialize renderers on module load
rendererFactory.initialize();

// Tool definitions factory - creates tools with injected userId and chatId
export function createVideoAgentTools(userId: string, chatId: string): ToolSet {
  return {
    createProject: {
      description:
        "Create a new video project with the specified DSL. Validates the DSL structure and saves to database. Mode: TEMPLATE or CREATIVE. DSL: Video DSL object with scenes, theme, config.",
      inputSchema: z.object({
        mode: z.enum(["TEMPLATE", "CREATIVE"]),
        dsl: z.record(z.string(), z.any()),
      }),
      execute: async (input) => {
        const { mode, dsl } = input;
        const validation = validateVideoDSL(dsl);

        if (!validation.success) {
          return {
            success: false,
            error: "Invalid Video DSL",
            details: validation.errors,
          };
        }

        try {
          const heroScene = validation.data.scenes.find((s) => s.type === "hero");
          console.log(
            `[Video Project] Creating project with hero title: ${heroScene?.props?.title || "N/A"}`
          );

          const project = await prisma.videoProject.create({
            data: {
              userId,
              chatId,
              mode,
              dsl: validation.data as Prisma.InputJsonValue,
            },
          });

          const duration =
            validation.data.scenes.reduce((sum, scene) => sum + scene.duration, 0) /
            validation.data.config.fps;

          return {
            success: true,
            projectId: project.id,
            message: `Video project created with ${validation.data.scenes.length} scenes (~${Math.round(duration)}s). Ready to preview!`,
            summary: {
              scenes: validation.data.scenes.map((s) => ({
                id: s.id,
                type: s.type,
                duration: s.duration,
              })),
              theme: validation.data.theme,
              totalDuration: `${Math.round(duration)} seconds`,
            },
          };
        } catch (error) {
          console.error("[Video Project] Creation failed:", error);
          return {
            success: false,
            error: "Failed to create project",
            details: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },

    updateProject: {
      description:
        "Update an existing video project with a new DSL. Use this to modify scenes, theme, or config.",
      inputSchema: z.object({
        projectId: z.string(),
        dsl: z.record(z.string(), z.any()),
      }),
      execute: async (input) => {
        const { projectId, dsl } = input;
        const validation = validateVideoDSL(dsl);

        if (!validation.success) {
          return {
            success: false,
            error: "Invalid Video DSL",
            details: validation.errors,
          };
        }

        try {
          const project = await prisma.videoProject.update({
            where: { id: projectId },
            data: {
              dsl: validation.data as Prisma.InputJsonValue,
              updatedAt: new Date(),
            },
          });

          const duration =
            validation.data.scenes.reduce((sum, scene) => sum + scene.duration, 0) /
            validation.data.config.fps;

          return {
            success: true,
            projectId: project.id,
            message: `Project updated! Now has ${validation.data.scenes.length} scenes (~${Math.round(duration)}s).`,
            summary: {
              scenes: validation.data.scenes.map((s) => ({
                id: s.id,
                type: s.type,
                duration: s.duration,
              })),
              totalDuration: `${Math.round(duration)} seconds`,
            },
          };
        } catch (error) {
          console.error("[Video Project] Update failed:", error);
          return {
            success: false,
            error: "Failed to update project",
            details: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },

    renderPreview: {
      description:
        "Generate a low-resolution preview video quickly. Uses Veedeo (2-5s) if available, falls back to Remotion.",
      inputSchema: z.object({
        projectId: z.string(),
        provider: z.enum(["veedeo", "remotion", "auto"]).optional().default("auto"),
      }),
      execute: async (input) => {
        const { projectId, provider } = input;

        try {
          const project = await prisma.videoProject.findUnique({
            where: { id: projectId },
          });

          if (!project) {
            return { success: false, error: "Project not found" };
          }

          const fullDSL = project.dsl as unknown as VideoDSL;

          // Create preview DSL (truncated, lower res)
          const previewDSL: VideoDSL = {
            ...fullDSL,
            scenes: fullDSL.scenes.slice(0, 3).map((scene) => ({
              ...scene,
              duration: Math.min(scene.duration, 90), // Max 3 seconds per scene
            })),
            config: {
              ...fullDSL.config,
              width: 854,
              height: 480,
            },
          };

          // Get renderer optimized for PREVIEW
          const renderer = rendererFactory.getRendererForType("PREVIEW", provider);

          if (!renderer) {
            return {
              success: false,
              error: "No video renderer available. Please configure VEEDEO_API_KEY or Remotion Lambda.",
            };
          }

          // Create render job
          const job = await prisma.videoJob.create({
            data: {
              projectId,
              type: "PREVIEW",
              status: "PENDING",
              progress: 0,
            },
          });

          // Start render
          const result = await renderer.render({
            jobId: job.id,
            dsl: previewDSL,
            type: "PREVIEW",
          });

          if (!result.success) {
            await prisma.videoJob.update({
              where: { id: job.id },
              data: { status: "FAILED", error: result.error },
            });
            return {
              success: false,
              error: result.error || "Failed to start preview render",
            };
          }

          // Update job with render info
          await prisma.videoJob.update({
            where: { id: job.id },
            data: {
              status: "RENDERING",
              outputUrl: result.outputUrl,
              renderId: result.externalId,
              provider: result.provider,
            },
          });

          const estimatedTime =
            result.provider === "veedeo" ? "2-5 seconds" : "10-30 seconds";

          return {
            success: true,
            jobId: job.id,
            message: `🎬 Preview rendering with ${result.provider}! ${estimatedTime}.`,
            statusUrl: `/api/video/status/${job.id}`,
            estimatedTime,
            provider: result.provider,
          };
        } catch (error) {
          console.error("[Video Render] Preview failed:", error);
          return {
            success: false,
            error: "Failed to start preview render",
            details: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },

    renderFinal: {
      description:
        "Render the final high-quality video (1080p+). Uses Remotion for best quality.",
      inputSchema: z.object({
        projectId: z.string(),
        provider: z.enum(["veedeo", "remotion", "auto"]).optional().default("auto"),
      }),
      execute: async (input) => {
        const { projectId, provider } = input;

        try {
          const project = await prisma.videoProject.findUnique({
            where: { id: projectId },
            include: {
              jobs: {
                where: { type: "FINAL", status: { not: "FAILED" } },
              },
            },
          });

          if (!project) {
            return { success: false, error: "Project not found" };
          }

          // Check if already rendering
          const existingJob = project.jobs.find(
            (j) => j.status === "PENDING" || j.status === "RENDERING"
          );
          if (existingJob) {
            return {
              success: false,
              error: "Already rendering final video",
              jobId: existingJob.id,
              message: "A final render is already in progress.",
            };
          }

          const dsl = project.dsl as unknown as VideoDSL;
          const duration =
            dsl.scenes.reduce((sum, scene) => sum + scene.duration, 0) / dsl.config.fps;

          // Get renderer optimized for FINAL (prefers Remotion for quality)
          const renderer = rendererFactory.getRendererForType("FINAL", provider);

          if (!renderer) {
            return {
              success: false,
              error: "No video renderer available.",
            };
          }

          // Create render job
          const job = await prisma.videoJob.create({
            data: {
              projectId,
              type: "FINAL",
              status: "PENDING",
              progress: 0,
            },
          });

          // Start render
          const result = await renderer.render({
            jobId: job.id,
            dsl,
            type: "FINAL",
          });

          if (!result.success) {
            await prisma.videoJob.update({
              where: { id: job.id },
              data: { status: "FAILED", error: result.error },
            });
            return {
              success: false,
              error: result.error || "Failed to start final render",
            };
          }

          // Update job
          await prisma.videoJob.update({
            where: { id: job.id },
            data: {
              status: "RENDERING",
              outputUrl: result.outputUrl,
              renderId: result.externalId,
              provider: result.provider,
            },
          });

          const estimatedMinutes = Math.ceil(duration / 60);

          return {
            success: true,
            jobId: job.id,
            message: `🎬 Final render started with ${result.provider}! Estimated: ${estimatedMinutes} minute${estimatedMinutes > 1 ? "s" : ""}.`,
            statusUrl: `/api/video/status/${job.id}`,
            estimatedTime: `${estimatedMinutes} minutes`,
            provider: result.provider,
          };
        } catch (error) {
          console.error("[Video Render] Final render failed:", error);
          return {
            success: false,
            error: "Failed to start final render",
            details: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },

    getRenderStatus: {
      description:
        "Check the current status of a video render job. Returns progress percentage and download URL when complete.",
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
            return { success: false, error: "Job not found" };
          }

          let currentProgress = job.progress;
          let currentStatus = job.status;
          let renderErrors = job.error;
          let outputUrl = job.outputUrl;

          // If rendering, poll provider for actual progress
          if (job.status === "RENDERING" && job.renderId && job.provider) {
            const renderer = rendererFactory.getRenderer(job.provider as RendererType);

            if (renderer) {
              try {
                const progress = await renderer.getProgress(job.renderId);

                currentProgress = progress.progress;

                if (progress.status === "COMPLETED") {
                  currentStatus = "COMPLETED";
                  outputUrl = progress.outputUrl || job.outputUrl;

                  await prisma.videoJob.update({
                    where: { id: jobId },
                    data: {
                      status: "COMPLETED",
                      progress: 100,
                      completedAt: new Date(),
                      outputUrl,
                    },
                  });
                } else if (progress.status === "FAILED") {
                  currentStatus = "FAILED";
                  renderErrors = progress.error || job.error;

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
          }

          const statusMessages: Record<string, string> = {
            PENDING: "⏳ Queued and waiting to start...",
            RENDERING: `🎬 Rendering in progress (${Math.round(currentProgress)}%)...`,
            COMPLETED: "✅ Render complete! Video ready for download.",
            FAILED: `❌ Render failed: ${renderErrors || "Unknown error"}`,
          };

          return {
            success: true,
            jobId: job.id,
            status: currentStatus,
            progress: currentProgress,
            type: job.type,
            message: statusMessages[currentStatus],
            outputUrl: currentStatus === "COMPLETED" ? outputUrl : null,
            downloadUrl: currentStatus === "COMPLETED" ? outputUrl : null,
            completedAt: job.completedAt,
            provider: job.provider,
          };
        } catch (error) {
          console.error(`[Video Render] Get status failed for job ${jobId}:`, error);
          return {
            success: false,
            error: "Failed to get render status",
            details: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    },
  };
}
