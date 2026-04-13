/**
 * Video Renderer Types
 * Provider pattern for swappable video rendering implementations
 * Following Context7 best practices for clean architecture
 */

import type { VideoDSL } from "@/lib/video-dsl";

export type RenderType = "PREVIEW" | "FINAL";

export type RenderStatus = "PENDING" | "RENDERING" | "COMPLETED" | "FAILED";

export interface RenderJob {
  id: string;
  projectId: string;
  type: RenderType;
  status: RenderStatus;
  progress: number;
  outputUrl?: string;
  error?: string;
  provider: string; // 'remotion' | 'veedeo'
  externalId?: string; // Provider-specific ID
  createdAt: Date;
  completedAt?: Date;
}

export interface RenderResult {
  success: boolean;
  jobId: string;
  provider: string;
  externalId?: string;
  outputUrl?: string;
  error?: string;
  estimatedTimeSeconds?: number;
}

export interface RenderProgress {
  status: RenderStatus;
  progress: number; // 0-100
  outputUrl?: string;
  error?: string;
}

export interface VideoRenderer {
  readonly name: string;
  readonly supportsRealtimeProgress: boolean;

  /**
   * Start a new render job
   */
  render(options: {
    jobId: string;
    dsl: VideoDSL;
    type: RenderType;
  }): Promise<RenderResult>;

  /**
   * Check render progress
   * For providers that don't support webhooks, this will poll
   */
  getProgress(externalId: string): Promise<RenderProgress>;

  /**
   * Cancel an ongoing render (if supported)
   */
  cancel?(externalId: string): Promise<boolean>;
}

// Configuration for each provider
export interface RemotionConfig {
  region: string;
  functionName: string;
  siteUrl: string;
}

export interface VeedeoConfig {
  apiKey: string;
  baseUrl?: string;
}
