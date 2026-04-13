/**
 * Video Status API (Refactored)
 * Supports both Remotion and Veedeo providers
 * Context7 best practices: Unified interface, error handling, streaming
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rendererFactory, type RendererType } from "@/lib/video-renderers";

const REMOTION_REGION = process.env.REMOTION_AWS_REGION || "us-east-1";
const REMOTION_FUNCTION_NAME = process.env.REMOTION_AWS_FUNCTION_NAME || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;

  try {
    const job = await prisma.videoJob.findUnique({
      where: { id: jobId },
      include: { project: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Verify ownership
    if (job.project.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`[Video Status API] Job ${jobId}: status=${job.status}, provider=${job.provider}`);

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
          console.error("[Video Status API] Error polling progress:", pollError);
          // Don't fail - return cached status
        }
      }
    }

    // Generate presigned URL if completed (for Remotion)
    let downloadUrl: string | null = null;
    if (currentStatus === "COMPLETED" && job.provider === "remotion" && job.renderId) {
      try {
        const { presignUrl } = await import("@remotion/lambda/client");
        const objectKey = job.outKey || `renders/${job.renderId}/${job.type.toLowerCase()}.mp4`;

        downloadUrl = await presignUrl({
          region: REMOTION_REGION as Parameters<typeof presignUrl>[0]["region"],
          bucketName: job.bucketName || `remotionlambda-${job.renderId.split("-")[0]}`,
          objectKey,
          expiresInSeconds: 3600,
          checkIfObjectExists: true,
        });
      } catch {
        downloadUrl = outputUrl || null;
      }
    } else if (currentStatus === "COMPLETED") {
      downloadUrl = outputUrl || null;
    }

    return NextResponse.json({
      jobId: job.id,
      status: currentStatus,
      progress: currentProgress,
      type: job.type,
      provider: job.provider,
      outputUrl,
      downloadUrl,
      error: renderErrors,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    console.error("[Video Status API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get render status" },
      { status: 500 }
    );
  }
}
