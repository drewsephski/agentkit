import { z } from "zod";

// Scene types supported by the video generation system
export const SceneTypeSchema = z.enum([
  "hero",
  "features",
  "cta",
  "text",
  "image",
  "stats",
  "testimonial",
  "logo",
]);

// Base scene schema with common properties
export const BaseSceneSchema = z.object({
  id: z.string(),
  type: SceneTypeSchema,
  duration: z.number().min(30).max(600), // frames (at 30fps = 1-20 seconds)
  transition: z.enum(["fade", "slide", "none"]).default("fade"),
});

// Hero scene - big title, subtitle, optional background
export const HeroSceneSchema = BaseSceneSchema.extend({
  type: z.literal("hero"),
  props: z.object({
    title: z.string().min(1).max(100),
    subtitle: z.string().max(200).optional(),
    background: z.enum(["gradient", "solid", "animated"]).default("gradient"),
    align: z.enum(["center", "left"]).default("center"),
  }),
});

// Features scene - list of features with icons
export const FeaturesSceneSchema = BaseSceneSchema.extend({
  type: z.literal("features"),
  props: z.object({
    title: z.string().max(100).optional(),
    items: z
      .array(
        z.object({
          icon: z.string().max(2), // emoji or short string
          text: z.string().min(1).max(100),
        })
      )
      .min(1)
      .max(5),
    layout: z.enum(["vertical", "grid", "horizontal"]).default("vertical"),
  }),
});

// CTA scene - call to action with button
export const CTASceneSchema = BaseSceneSchema.extend({
  type: z.literal("cta"),
  props: z.object({
    headline: z.string().min(1).max(100),
    subtext: z.string().max(200).optional(),
    buttonText: z.string().min(1).max(50).default("Get Started"),
    url: z.string().max(100).optional(),
  }),
});

// Text scene - animated text display
export const TextSceneSchema = BaseSceneSchema.extend({
  type: z.literal("text"),
  props: z.object({
    text: z.string().min(1).max(500),
    animation: z.enum(["typewriter", "fade", "slide"]).default("fade"),
    align: z.enum(["center", "left", "right"]).default("center"),
  }),
});

// Image scene - display image with optional overlay
export const ImageSceneSchema = BaseSceneSchema.extend({
  type: z.literal("image"),
  props: z.object({
    src: z.string().url(),
    overlay: z.enum(["none", "dark", "gradient"]).default("none"),
    caption: z.string().max(200).optional(),
  }),
});

// Stats scene - animated numbers/stats
export const StatsSceneSchema = BaseSceneSchema.extend({
  type: z.literal("stats"),
  props: z.object({
    items: z
      .array(
        z.object({
          value: z.string().min(1).max(20), // "10K", "99%", etc.
          label: z.string().min(1).max(50),
        })
      )
      .min(1)
      .max(4),
  }),
});

// Testimonial scene - quote and attribution
export const TestimonialSceneSchema = BaseSceneSchema.extend({
  type: z.literal("testimonial"),
  props: z.object({
    quote: z.string().min(1).max(300),
    author: z.string().min(1).max(100),
    role: z.string().max(100).optional(),
  }),
});

// Logo scene - logo display/animation
export const LogoSceneSchema = BaseSceneSchema.extend({
  type: z.literal("logo"),
  props: z.object({
    text: z.string().min(1).max(50),
    subtitle: z.string().max(100).optional(),
    animation: z.enum(["fade", "scale", "slide"]).default("fade"),
  }),
});

// Union of all scene types
export const SceneSchema = z.discriminatedUnion("type", [
  HeroSceneSchema,
  FeaturesSceneSchema,
  CTASceneSchema,
  TextSceneSchema,
  ImageSceneSchema,
  StatsSceneSchema,
  TestimonialSceneSchema,
  LogoSceneSchema,
]);

// Theme configuration
export const ThemeSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#10b981"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#059669"),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#0f172a"),
  font: z.enum(["Inter", "Geist", "Roboto", "Poppins"]).default("Inter"),
});

// Video configuration (resolution, fps, etc.)
export const VideoConfigSchema = z.object({
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
  fps: z.number().int().min(24).max(60).default(30),
  durationInFrames: z.number().int().positive().optional(), // auto-calculated from scenes if not provided
});

// Complete Video DSL schema
export const VideoDSLSchema = z.object({
  version: z.literal("1.0").default("1.0"),
  scenes: z.array(SceneSchema).min(1).max(10),
  theme: ThemeSchema,
  config: VideoConfigSchema,
  metadata: z
    .object({
      title: z.string().max(100).optional(),
      description: z.string().max(500).optional(),
    })
    .optional(),
});

// Types derived from schemas
export type SceneType = z.infer<typeof SceneTypeSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type HeroScene = z.infer<typeof HeroSceneSchema>;
export type FeaturesScene = z.infer<typeof FeaturesSceneSchema>;
export type CTAScene = z.infer<typeof CTASceneSchema>;
export type TextScene = z.infer<typeof TextSceneSchema>;
export type ImageScene = z.infer<typeof ImageSceneSchema>;
export type StatsScene = z.infer<typeof StatsSceneSchema>;
export type TestimonialScene = z.infer<typeof TestimonialSceneSchema>;
export type LogoScene = z.infer<typeof LogoSceneSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type VideoConfig = z.infer<typeof VideoConfigSchema>;
export type VideoDSL = z.infer<typeof VideoDSLSchema>;

// Validation function
export function validateVideoDSL(data: unknown): { success: true; data: VideoDSL } | { success: false; errors: string[] } {
  const result = VideoDSLSchema.safeParse(data);
  if (result.success) {
    // Calculate total duration from scenes
    const totalFrames = result.data.scenes.reduce((sum, scene) => sum + scene.duration, 0);
    return {
      success: true,
      data: {
        ...result.data,
        config: {
          ...result.data.config,
          durationInFrames: totalFrames,
        },
      },
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {
    success: false,
    errors: result.error.issues.map((issue: any) => `${issue.path.join(".")}: ${issue.message}`),
  };
}

// Helper to create a default DSL
export function createDefaultVideoDSL(partial: Partial<VideoDSL> = {}): VideoDSL {
  const defaultDSL: VideoDSL = {
    version: "1.0",
    scenes: [
      {
        id: "scene-1",
        type: "hero",
        duration: 90,
        transition: "fade",
        props: {
          title: "Your Title Here",
          subtitle: "Your subtitle here",
          background: "gradient",
          align: "center",
        },
      },
    ],
    theme: {
      primaryColor: "#10b981",
      secondaryColor: "#059669",
      backgroundColor: "#0f172a",
      font: "Inter",
    },
    config: {
      width: 1920,
      height: 1080,
      fps: 30,
    },
  };

  return {
    ...defaultDSL,
    ...partial,
    scenes: partial.scenes ?? defaultDSL.scenes,
    theme: { ...defaultDSL.theme, ...partial.theme },
    config: { ...defaultDSL.config, ...partial.config },
  };
}

// Calculate total duration in seconds
export function getVideoDurationSeconds(dsl: VideoDSL): number {
  const totalFrames = dsl.scenes.reduce((sum, scene) => sum + scene.duration, 0);
  return totalFrames / dsl.config.fps;
}

// Check if DSL is suitable for preview (short enough)
export function isPreviewSuitable(dsl: VideoDSL): boolean {
  const duration = getVideoDurationSeconds(dsl);
  return duration <= 10; // Max 10 seconds for preview
}

// Create a preview-friendly version (truncated)
export function createPreviewDSL(fullDSL: VideoDSL): VideoDSL {
  // Take first 5 seconds worth of scenes or first 3 scenes
  let frameBudget = 150; // 5 seconds at 30fps
  const previewScenes: Scene[] = [];

  for (const scene of fullDSL.scenes.slice(0, 3)) {
    if (frameBudget <= 0) break;
    const duration = Math.min(scene.duration, frameBudget);
    previewScenes.push({
      ...scene,
      id: `${scene.id}-preview`,
      duration,
    });
    frameBudget -= duration;
  }

  return {
    ...fullDSL,
    scenes: previewScenes,
    config: {
      ...fullDSL.config,
      width: Math.min(fullDSL.config.width, 854), // 480p width max for preview
      height: Math.min(fullDSL.config.height, 480),
    },
  };
}
