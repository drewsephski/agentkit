/**
 * Veedeo Webhook Handler
 * Receives real-time render progress updates
 * Context7 best practices: Webhook signature verification, error handling
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface VeedeoWebhookPayload {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  output_url?: string;
  error?: string;
}

/**
 * POST /api/video/webhook/veedeo
 * Receives webhook notifications from Veedeo
 */
export async function POST(request: NextRequest) {
  try {
    // Context7 best practice: Verify webhook signature if available
    // const signature = request.headers.get("x-veedeo-signature");
    // TODO: Implement signature verification when Veedeo supports it

    const payload: VeedeoWebhookPayload = await request.json();

    console.log("[Veedeo Webhook] Received:", {
      taskId: payload.task_id,
      status: payload.status,
      progress: payload.progress,
    });

    // Find job by external renderId
    const job = await prisma.videoJob.findFirst({
      where: {
        renderId: payload.task_id,
        provider: "veedeo",
      },
    });

    if (!job) {
      console.warn(`[Veedeo Webhook] Job not found for task: ${payload.task_id}`);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Update job status based on webhook
    if (payload.status === "completed") {
      await prisma.videoJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          progress: 100,
          outputUrl: payload.output_url,
          completedAt: new Date(),
        },
      });
      console.log(`[Veedeo Webhook] Job ${job.id} completed`);
    } else if (payload.status === "failed") {
      await prisma.videoJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: payload.error || "Render failed",
        },
      });
      console.error(`[Veedeo Webhook] Job ${job.id} failed:`, payload.error);
    } else {
      // processing - update progress
      await prisma.videoJob.update({
        where: { id: job.id },
        data: {
          status: "RENDERING",
          progress: payload.progress ?? job.progress,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Veedeo Webhook] Error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
