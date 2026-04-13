import { renderMediaOnLambda } from "@remotion/lambda";
import { bundle } from "@remotion/bundler";
import path from "path";
import { type VideoDSL } from "./video-dsl";

// Configuration for Remotion Lambda
const REGION = process.env.AWS_REGION || "us-east-1";
const FUNCTION_NAME = process.env.REMOTION_FUNCTION_NAME || "";
const BUCKET_NAME = process.env.REMOTION_BUCKET_NAME || "";

interface RenderOptions {
  jobId: string;
  dsl: VideoDSL;
  type: "PREVIEW" | "FINAL";
}

interface RenderResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Renders a video using Remotion Lambda
 */
export async function renderVideoOnLambda({
  jobId,
  dsl,
  type,
}: RenderOptions): Promise<RenderResult> {
  try {
    if (!FUNCTION_NAME || !BUCKET_NAME) {
      return {
        success: false,
        error: "Remotion Lambda not configured. Set REMOTION_FUNCTION_NAME and REMOTION_BUCKET_NAME env vars.",
      };
    }

    // Bundle the Remotion project
    const bundled = await bundle({
      entryPoint: path.join(process.cwd(), "remotion/index.ts"),
    });

    // Determine composition ID based on DSL complexity
    // For now, we use a single dynamic composition that accepts the DSL as props
    const compositionId = "DynamicVideo";

    // Configure render based on type
    const isPreview = type === "PREVIEW";
    
    // Render on Lambda
    const result = await renderMediaOnLambda({
      region: REGION as any,
      functionName: FUNCTION_NAME,
      serveUrl: bundled,
      composition: compositionId,
      inputProps: {
        dsl,
        jobId,
      },
      codec: "h264",
      // Lower quality for previews
      ...(isPreview && {
        jpegQuality: 80,
        scale: 0.5, // 50% scale for preview
      }),
      // Higher quality for finals
      ...(!isPreview && {
        jpegQuality: 95,
        scale: 1,
      }),
    });

    // The output URL will be available after render completes
    // For now, return a placeholder that will be updated via polling
    const outputUrl = result.renderId 
      ? `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/renders/${result.renderId}/out.mp4`
      : undefined;

    return {
      success: true,
      url: outputUrl,
    };
  } catch (error) {
    console.error("Render error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown render error",
    };
  }
}

/**
 * Get the status of a Lambda render job
 */
export async function getLambdaRenderStatus(renderId: string): Promise<{
  status: "pending" | "rendering" | "completed" | "failed";
  progress: number;
  url?: string;
}> {
  // This would use getRenderProgress from @remotion/lambda
  // For now, return placeholder
  return {
    status: "pending",
    progress: 0,
  };
}
