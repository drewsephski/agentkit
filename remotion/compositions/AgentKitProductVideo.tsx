import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  staticFile,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { loadFont } from "@remotion/google-fonts/Geist";

const { fontFamily } = loadFont();

interface AgentKitProductVideoProps {
  productName: string;
  tagline: string;
  primaryColor?: string;
  secondaryColor?: string;
  features?: Array<{ icon?: string; title: string; description?: string }>;
  stats?: Array<{ value: string; label: string }>;
  ctaHeadline?: string;
  ctaSubtext?: string;
  ctaButtonText?: string;
}

// Scene 1: Hook - Problem Statement
const HookScene: React.FC<{ productName: string; tagline: string; primaryColor?: string }> = ({ 
  productName, 
  tagline,
  primaryColor = "#10b981" 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  const subtitleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Animated background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          opacity: 0.5,
        }}
      />

      {/* Logo/Brand */}
      <div
        style={{
          transform: `scale(${titleProgress})`,
          opacity: titleProgress,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)",
            marginBottom: 40,
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
          </svg>
        </div>
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: "white",
          margin: 0,
          marginBottom: 24,
          textAlign: "center",
          transform: `translateY(${(1 - titleProgress) * 30}px)`,
          opacity: titleProgress,
          textShadow: "0 4px 30px rgba(0,0,0,0.3)",
        }}
      >
        {productName}
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: 32,
          fontWeight: 400,
          color: "#94a3b8",
          margin: 0,
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.4,
          transform: `translateY(${(1 - subtitleProgress) * 20}px)`,
          opacity: subtitleProgress,
        }}
      >
        {tagline}
      </p>

      {/* Animated indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          opacity: interpolate(frame, [100, 130], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          }),
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "2px solid rgba(16, 185, 129, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s infinite",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Problem - The Pain Point
const ProblemScene: React.FC<{ productName?: string }> = ({ productName = "This" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 50,
  });

  const items = [
    "Authentication from scratch",
    "Chat UI & streaming responses",
    "Web search integration",
    "Database persistence",
    "Deployment & scaling",
  ];

  return (
    <AbsoluteFill
      style={{
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        padding: 80,
      }}
    >
      <h2
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          marginBottom: 60,
          textAlign: "center",
          opacity: progress,
          transform: `translateY(${(1 - progress) * 20}px)`,
        }}
      >
        Building {productName} from scratch takes{" "}
        <span style={{ color: "#ef4444", textDecoration: "line-through" }}>
          weeks
        </span>
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: "100%",
          maxWidth: 600,
        }}
      >
        {items.map((item, index) => {
          const itemProgress = spring({
            frame: frame - 30 - index * 10,
            fps,
            config: { damping: 200 },
            durationInFrames: 30,
          });

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 24px",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: 12,
                border: "1px solid rgba(239, 68, 68, 0.2)",
                opacity: itemProgress,
                transform: `translateX(${(1 - itemProgress) * -30}px)`,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
              <span
                style={{
                  fontSize: 24,
                  color: "#e2e8f0",
                  fontWeight: 500,
                }}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 40,
          fontSize: 28,
          color: "#94a3b8",
          opacity: interpolate(frame, [150, 180], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        ...and 120+ hours of development time
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: Solution - Features
const SolutionScene: React.FC<{ 
  features?: Array<{ icon?: string; title: string; description?: string }>;
  primaryColor?: string;
}> = ({ 
  features: customFeatures,
  primaryColor = "#10b981"
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  // Use provided features or fallback to defaults
  const features = customFeatures?.length ? customFeatures.map(f => ({
    icon: f.icon || "✨",
    title: f.title,
    desc: f.description || "",
  })) : [
    {
      icon: "⚡",
      title: "Web Search Toggle",
      desc: "Enable real-time web search with one click",
    },
    {
      icon: "🔐",
      title: "Authentication",
      desc: "Clerk auth ready - OAuth, email, magic links",
    },
    {
      icon: "💬",
      title: "Streaming Chat",
      desc: "Real-time responses with tool call visualization",
    },
    {
      icon: "💾",
      title: "Persistence",
      desc: "PostgreSQL + Prisma for chat history",
    },
    {
      icon: "🚀",
      title: "One-Click Deploy",
      desc: "Vercel-ready with automatic migrations",
    },
    {
      icon: "🎨",
      title: "Beautiful UI",
      desc: "shadcn/ui components with dark mode",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
        padding: 60,
      }}
    >
      <h2
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          marginBottom: 50,
          textAlign: "center",
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 20}px)`,
        }}
      >
        Everything you need,{" "}
        <span style={{ color: "#10b981" }}>out of the box</span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          maxWidth: 1200,
        }}
      >
        {features.map((feature, index) => {
          const featureProgress = spring({
            frame: frame - 20 - index * 8,
            fps,
            config: { damping: 200 },
            durationInFrames: 35,
          });

          return (
            <div
              key={index}
              style={{
                padding: 28,
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 16,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                opacity: featureProgress,
                transform: `scale(${0.8 + featureProgress * 0.2}) translateY(${
                  (1 - featureProgress) * 20
                }px)`,
                transition: "none",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  marginBottom: 12,
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "white",
                  margin: "0 0 8px 0",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  color: "#94a3b8",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Demo - Show the product
const DemoScene: React.FC<{ productName?: string }> = ({ productName = "AgentKit" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 50,
  });

  return (
    <AbsoluteFill
      style={{
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      <h2
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: "white",
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        See it in action
      </h2>

      {/* Mock Chat Interface */}
      <div
        style={{
          width: 800,
          height: 500,
          background: "#1e293b",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          transform: `scale(${0.9 + containerProgress * 0.1})`,
          opacity: containerProgress,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: 14 }}>AI</span>
            </div>
            <span
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {productName} Chat
            </span>
          </div>

          {/* Web Search Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: "rgba(16, 185, 129, 0.2)",
              borderRadius: 20,
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span
              style={{
                color: "#10b981",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Web Search ON
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* User Message */}
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "70%",
              padding: "12px 16px",
              background: "#10b981",
              borderRadius: "16px 16px 4px 16px",
              color: "white",
              fontSize: 15,
            }}
          >
            What's the latest news about AI today?
          </div>

          {/* AI Response with typing animation */}
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "85%",
              padding: "16px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px 16px 16px 4px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              />
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                Searching the web...
              </span>
            </div>

            <p
              style={{
                color: "#e2e8f0",
                fontSize: 15,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {frame > 90
                ? "Here are the top AI headlines from today: OpenAI announced GPT-4 Turbo improvements, Anthropic released Claude 3.5 Sonnet with enhanced coding abilities, and Google unveiled new AI features for Workspace..."
                : frame > 60
                  ? "Here are the top AI headlines from today: OpenAI announced GPT-4 Turbo improvements, Anthropic released..."
                  : frame > 30
                    ? "Here are the top AI headlines..."
                    : "Here are..."}
            </p>

            {/* Sources */}
            {frame > 120 && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {["openai.com", "anthropic.com", "blog.google"].map(
                  (source, i) => (
                    <span
                      key={source}
                      style={{
                        padding: "4px 10px",
                        background: "rgba(16, 185, 129, 0.1)",
                        borderRadius: 12,
                        color: "#10b981",
                        fontSize: 12,
                        opacity: frame > 120 + i * 10 ? 1 : 0,
                        transition: "opacity 0.3s",
                      }}
                    >
                      {source}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            gap: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "12px 16px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 24,
              color: "#64748b",
              fontSize: 15,
            }}
          >
            Type your message...
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Pricing & CTA
const CTAScene: React.FC<{
  productName?: string;
  ctaHeadline?: string;
  ctaSubtext?: string;
  ctaButtonText?: string;
  primaryColor?: string;
}> = ({ 
  productName = "AgentKit",
  ctaHeadline,
  ctaSubtext,
  ctaButtonText,
  primaryColor = "#10b981"
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 50,
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{
          textAlign: "center",
          opacity: progress,
          transform: `translateY(${(1 - progress) * 30}px)`,
        }}
      >
        <h2
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "white",
            marginBottom: 20,
          }}
        >
          {ctaHeadline || `Ready to build with ${productName}?`}
        </h2>

        <p
          style={{
            fontSize: 24,
            color: "#94a3b8",
            marginBottom: 50,
          }}
        >
          {ctaSubtext || `Join 100+ developers shipping faster with ${productName}`}
        </p>

        {/* Pricing Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 24,
            padding: 40,
            border: "1px solid rgba(16, 185, 129, 0.3)",
            boxShadow: "0 0 60px rgba(16, 185, 129, 0.2)",
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              background: "rgba(16, 185, 129, 0.2)",
              borderRadius: 20,
              color: "#10b981",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            Limited Time
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: "white",
              }}
            >
              $239
            </span>
            <span
              style={{
                fontSize: 24,
                color: "#64748b",
                textDecoration: "line-through",
              }}
            >
              $299
            </span>
          </div>

          <p
            style={{
              fontSize: 16,
              color: "#94a3b8",
              marginBottom: 24,
            }}
          >
            White-label license • One-time payment
          </p>

          <div
            style={{
              padding: "16px 32px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              borderRadius: 12,
              color: "white",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 10px 40px rgba(16, 185, 129, 0.4)",
            }}
          >
            {ctaButtonText || `Get ${productName} →`}
          </div>

          <p
            style={{
              fontSize: 14,
              color: "#64748b",
              marginTop: 16,
            }}
          >
            Use code EARLYBIRD for 20% off
          </p>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            color: "#64748b",
          }}
        >
          {productName.toLowerCase().replace(/\s+/g, '')}.dev
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Main Video Component
export const AgentKitProductVideo: React.FC<AgentKitProductVideoProps> = ({
  productName,
  tagline,
  primaryColor,
  secondaryColor,
  features,
  stats,
  ctaHeadline,
  ctaSubtext,
  ctaButtonText,
}) => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 1: Hook - 5 seconds */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <HookScene productName={productName} tagline={tagline} primaryColor={primaryColor} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 2: Problem - 7 seconds */}
        <TransitionSeries.Sequence durationInFrames={210}>
          <ProblemScene productName={productName} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 3: Solution - 8 seconds */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <SolutionScene features={features} primaryColor={primaryColor} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 4: Demo - 10 seconds */}
        <TransitionSeries.Sequence durationInFrames={300}>
          <DemoScene productName={productName} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 5: CTA - 6 seconds */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <CTAScene 
            productName={productName} 
            ctaHeadline={ctaHeadline} 
            ctaSubtext={ctaSubtext} 
            ctaButtonText={ctaButtonText}
            primaryColor={primaryColor}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
