import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRenderProgress, presignUrl, type AwsRegion } from "@remotion/lambda/client";

const REMOTION_REGION = (process.env.REMOTION_AWS_REGION || "us-east-1") as AwsRegion;
const REMOTION_FUNCTION_NAME = process.env.REMOTION_AWS_FUNCTION_NAME || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
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

    // Verify the job belongs to the authenticated user
    if (job.project.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`[Video Status API] Job ${jobId}: status=${job.status}, renderId=${job.renderId}, outKey=${job.outKey}`);

    // If rendering, poll Lambda for actual progress
    let currentProgress = job.progress;
    let currentStatus = job.status;
    let renderErrors = job.error;
    let outputUrl = job.outputUrl;

    if (job.status === "RENDERING" && job.renderId && job.bucketName) {
      try {
        const progress = await getRenderProgress({
          region: REMOTION_REGION,
          functionName: REMOTION_FUNCTION_NAME,
          renderId: job.renderId,
          bucketName: job.bucketName,
        });

        // Update progress (overallProgress is 0-1)
        currentProgress = Math.round(progress.overallProgress * 100);

        // Check if render is complete
        if (progress.done) {
          currentStatus = "COMPLETED";
          currentProgress = 100;
          outputUrl = progress.outputFile || job.outputUrl;
          await prisma.videoJob.update({
            where: { id: jobId },
            data: {
              status: "COMPLETED",
              progress: 100,
              completedAt: new Date(),
              outputUrl,
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
        console.error("[Video Status API] Error polling progress:", pollError);
        // Log full error details
        if (pollError instanceof Error) {
          console.error(`[Video Status API] Error details: ${pollError.message}`);
          console.error(`[Video Status API] Error stack: ${pollError.stack}`);
        }
        // Don't fail - return cached status
      }
    }

    // Generate presigned URL if completed
    let downloadUrl: string | null = null;
    if (currentStatus === "COMPLETED" && job.bucketName) {
      try {
        // Use the actual S3 key from Remotion if available, otherwise construct it using renderId
        // Remotion stores files in renders/{renderId}/{filename}.mp4
        const objectKey = job.outKey || (job.renderId ? `renders/${job.renderId}/${job.type.toLowerCase()}.mp4` : null);
        if (!objectKey) {
          console.error(`[Video Status] Missing renderId for job ${jobId}, cannot construct S3 key`);
        } else {
          console.log(`[Video Status] Generating presigned URL for key: ${objectKey}`);
          const signedUrl = await presignUrl({
            region: REMOTION_REGION,
            bucketName: job.bucketName,
            objectKey,
            expiresInSeconds: 3600, // 1 hour
            checkIfObjectExists: true,
          });
          downloadUrl = signedUrl;
        }
      } catch (err) {
        console.error("[Video Status API] Error generating presigned URL:", err);
      }
    }

    console.log(`[Video Status API] Returning for job ${jobId}: status=${currentStatus}, downloadUrl=${downloadUrl ? downloadUrl.substring(0, 80) + '...' : 'null'}`);

    return NextResponse.json({
      jobId: job.id,
      status: currentStatus,
      progress: currentProgress,
      type: job.type,
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
      { status: 500 },
    );
  }
}
