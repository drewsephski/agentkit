import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { presignUrl, type AwsRegion } from "@remotion/lambda/client";

const REMOTION_REGION = (process.env.REMOTION_AWS_REGION || "us-east-1") as AwsRegion;

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

    // Can only download completed jobs
    if (job.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Video not ready", status: job.status, progress: job.progress },
        { status: 425 }, // Too Early
      );
    }

    if (!job.bucketName) {
      return NextResponse.json(
        { error: "Missing bucket information" },
        { status: 500 },
      );
    }

    // Generate a presigned URL for download
    try {
      // Use the actual S3 key from Remotion if available, otherwise construct it using renderId
      // Remotion stores files in renders/{renderId}/{filename}.mp4
      const objectKey = job.outKey || (job.renderId ? `renders/${job.renderId}/${job.type.toLowerCase()}.mp4` : null);
      if (!objectKey) {
        return NextResponse.json(
          { error: "Missing render information - cannot locate video file" },
          { status: 500 },
        );
      }
      console.log(`[Video Download] Generating presigned URL for key: ${objectKey}`);
      const signedUrl = await presignUrl({
        region: REMOTION_REGION,
        bucketName: job.bucketName,
        objectKey,
        expiresInSeconds: 3600, // 1 hour
        checkIfObjectExists: true,
      });

      if (!signedUrl) {
        console.error(`[Video Download] File not found at key: ${objectKey} in bucket: ${job.bucketName}`);
        return NextResponse.json(
          { error: "Video file not found in storage", key: objectKey, bucket: job.bucketName },
          { status: 404 },
        );
      }

      console.log(`[Video Download] Generated presigned URL: ${signedUrl.substring(0, 100)}...`);

      // Redirect to the signed URL
      return NextResponse.redirect(signedUrl);
    } catch (err) {
      console.error("[Video Download API] Error generating presigned URL:", err);
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[Video Download API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process download request" },
      { status: 500 },
    );
  }
}
