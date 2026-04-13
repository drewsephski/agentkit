import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont } from "@remotion/google-fonts/Geist";

const { fontFamily } = loadFont();

interface AgentKitHeroVideoProps {
  productName?: string;
  tagline?: string;
}

// ==========================================
// SCENE 1: HOOK - Explosive Opening (3s)
// ==========================================
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 300, mass: 0.8 },
    durationInFrames: 25,
  });

  const flashOpacity = interpolate(frame, [0, 5, 15], [1, 0.4, 0], {
    extrapolateRight: "clamp",
  });

  const words = ["Build", "AI", "Agents", "in", "Hours,", "Not", "Weeks"];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 70%)",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Animated background grid */}
      <div
        style={{
          position: "absolute",
          inset: -100,
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: `rotate(${frame * 0.15}deg) scale(${1.5 + entrance * 0.3})`,
          opacity: 0.4,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${entrance})`,
          opacity: entrance,
          marginBottom: 30,
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
            boxShadow: "0 20px 60px rgba(16, 185, 129, 0.5)",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
          </svg>
        </div>
      </div>

      {/* Word-by-word reveal */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 16px",
          padding: "0 60px",
          maxWidth: 1200,
        }}
      >
        {words.map((word, index) => {
          const wordProgress = spring({
            frame: frame - index * 4,
            fps,
            config: { damping: 20, stiffness: 250 },
            durationInFrames: 20,
          });

          const isHighlighted = word === "AI" || word === "Hours," || word === "Not";

          return (
            <span
              key={index}
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: isHighlighted ? "#10b981" : "white",
                textTransform: "uppercase",
                transform: `scale(${0.8 + wordProgress * 0.2}) translateY(${(1 - wordProgress) * 40}px)`,
                opacity: wordProgress,
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                letterSpacing: "2px",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: 32,
          color: "#94a3b8",
          marginTop: 24,
          opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [40, 60], [20, 0], { extrapolateRight: "clamp" })}px)`,
        }}
      >
        The complete AI agent starter kit
      </p>

      {/* Pulse ring */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: "3px solid rgba(16, 185, 129, 0.5)",
          transform: `scale(${1 + entrance * 2})`,
          opacity: 1 - entrance,
        }}
      />
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 2: THE PROBLEM - Pain Points (4s)
// ==========================================
const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const painPoints = [
    { text: "120+ hours of setup", icon: "⏰", subtext: "Authentication, database, UI" },
    { text: "Complex integrations", icon: "🔧", subtext: "Web search, AI models, APIs" },
    { text: "Reinventing the wheel", icon: "🔄", subtext: "Every project starts from zero" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        padding: 60,
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "white",
          marginBottom: 40,
          textAlign: "center",
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 30}px)`,
        }}
      >
        Building AI agents{" "}
        <span style={{ color: "#ef4444", textDecoration: "line-through" }}>the hard way</span>
      </h2>

      {/* Pain points - horizontal layout */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 24,
          width: "100%",
          maxWidth: 1400,
          justifyContent: "center",
        }}
      >
        {painPoints.map((point, index) => {
          const pointProgress = spring({
            frame: frame - 20 - index * 12,
            fps,
            config: { damping: 20, stiffness: 200 },
            durationInFrames: 30,
          });

          const shake = interpolate(
            frame,
            [40 + index * 12, 45 + index * 12, 50 + index * 12],
            [0, 8, 0],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "32px 28px",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: 20,
                border: "2px solid rgba(239, 68, 68, 0.25)",
                transform: `translateY(${(1 - pointProgress) * -50}px) translateX(${shake}px)`,
                opacity: pointProgress,
                flex: 1,
                maxWidth: 380,
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 48 }}>{point.icon}</span>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                {point.text}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#94a3b8",
                }}
              >
                {point.subtext}
              </div>
              {/* Animated X */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 8,
                  transform: `scale(${pointProgress}) rotate(${pointProgress * 180}deg)`,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom text */}
      <div
        style={{
          marginTop: 40,
          fontSize: 28,
          color: "#64748b",
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Sound familiar? 👇
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 3: USE CASES - Real Applications (5s)
// ==========================================
const UseCasesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const useCases = [
    { icon: "🤖", title: "Customer Support", desc: "24/7 AI that answers questions" },
    { icon: "📊", title: "Research Assistant", desc: "Web search + analysis combined" },
    { icon: "💼", title: "Sales Automation", desc: "Qualify leads automatically" },
    { icon: "🔬", title: "Knowledge Base", desc: "Internal docs AI for teams" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        padding: 60,
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Title */}
      <h2
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "white",
          marginBottom: 50,
          textAlign: "center",
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 30}px)`,
          textShadow: "0 0 40px rgba(16, 185, 129, 0.3)",
        }}
      >
        What will <span style={{ color: "#10b981" }}>you</span> build?
      </h2>

      {/* Use cases - horizontal row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 24,
          width: "100%",
          maxWidth: 1400,
          justifyContent: "center",
        }}
      >
        {useCases.map((useCase, index) => {
          const caseProgress = spring({
            frame: frame - 15 - index * 10,
            fps,
            config: { damping: 20, stiffness: 200 },
            durationInFrames: 30,
          });

          return (
            <div
              key={index}
              style={{
                padding: "32px 24px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: 20,
                border: "1px solid rgba(16, 185, 129, 0.2)",
                opacity: caseProgress,
                transform: `scale(${0.9 + caseProgress * 0.1}) translateY(${(1 - caseProgress) * 30}px)`,
                flex: 1,
                maxWidth: 320,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 16 }}>{useCase.icon}</div>
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "white",
                  margin: "0 0 8px 0",
                }}
              >
                {useCase.title}
              </h3>
              <p
                style={{
                  fontSize: 17,
                  color: "#94a3b8",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {useCase.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA preview */}
      <div
        style={{
          marginTop: 45,
          fontSize: 26,
          color: "#64748b",
          opacity: interpolate(frame, [90, 110], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        All built with <span style={{ color: "#10b981", fontWeight: 700 }}>AgentKit</span> ⚡
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 4: DEMO - Show the Product (6s)
// ==========================================
const DemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  const typingProgress = interpolate(frame, [60, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fullText = "Here are today's top AI headlines: OpenAI released GPT-4 Turbo updates, Anthropic launched Claude 3.5 with coding improvements, and Google announced new AI Workspace features...";
  const displayedText = fullText.slice(0, Math.floor(fullText.length * typingProgress));

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        padding: "0 80px",
        gap: 60,
      }}
    >
      {/* Left side - Title and badges */}
      <div
        style={{
          flex: 1,
          maxWidth: 450,
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "white",
            marginBottom: 30,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            transform: `translateX(${interpolate(frame, [0, 20], [50, 0], { extrapolateRight: "clamp" })}px)`,
          }}
        >
          See it in action 🎬
        </h2>

        <p
          style={{
            fontSize: 22,
            color: "#94a3b8",
            marginBottom: 30,
            lineHeight: 1.5,
            opacity: interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Web search, streaming responses, and persistent chat - all working out of the box.
        </p>

        {/* Feature badges */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            opacity: interpolate(frame, [40, 70], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {[
            { icon: "⚡", text: "Real-time streaming" },
            { icon: "🔍", text: "Web search enabled" },
            { icon: "💾", text: "Persistent history" },
          ].map((item, i) => (
            <div
              key={item.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                background: "rgba(16, 185, 129, 0.1)",
                borderRadius: 12,
                border: "1px solid rgba(16, 185, 129, 0.2)",
                transform: `translateX(${interpolate(frame, [40 + i * 10, 60 + i * 10], [30, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(frame, [40 + i * 10, 60 + i * 10], [0, 1], { extrapolateRight: "clamp" }),
              }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ color: "#10b981", fontSize: 18, fontWeight: 600 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Chat Interface Mock */}
      <div
        style={{
          width: 480,
          height: 520,
          background: "#1e293b",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          boxShadow: "0 25px 80px -20px rgba(0, 0, 0, 0.6)",
          transform: `scale(${0.9 + containerProgress * 0.1})`,
          opacity: containerProgress,
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
              </svg>
            </div>
            <span style={{ color: "white", fontSize: 15, fontWeight: 600 }}>AgentKit Chat</span>
          </div>

          {/* Web Search Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "rgba(16, 185, 129, 0.15)",
              borderRadius: 16,
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span style={{ color: "#10b981", fontSize: 12, fontWeight: 600 }}>Web Search ON</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            height: "calc(100% - 120px)",
          }}
        >
          {/* User Message */}
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "85%",
              padding: "12px 16px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              borderRadius: "16px 16px 4px 16px",
              color: "white",
              fontSize: 14,
              opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateX(${interpolate(frame, [40, 55], [30, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            What's the latest AI news today?
          </div>

          {/* AI Response */}
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "95%",
              padding: "14px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px 16px 16px 4px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              opacity: interpolate(frame, [55, 70], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            {/* AI Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              />
              <span style={{ color: "#94a3b8", fontSize: 12 }}>
                {frame < 90 ? "Searching the web..." : "AI Assistant"}
              </span>
              {frame < 90 && (
                <span style={{ display: "inline-flex", gap: 2 }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        background: "#10b981",
                        opacity: interpolate(frame, [60 + i * 5, 75 + i * 5], [0.3, 1], { extrapolateRight: "clamp" }),
                      }}
                    />
                  ))}
                </span>
              )}
            </div>

            {/* Response text with typing effect */}
            <p
              style={{
                color: "#e2e8f0",
                fontSize: 14,
                lineHeight: 1.5,
                margin: 0,
                minHeight: 50,
              }}
            >
              {displayedText}
              {typingProgress < 1 && frame > 60 && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: 16,
                    background: "#10b981",
                    marginLeft: 4,
                    verticalAlign: "middle",
                  }}
                />
              )}
            </p>

            {/* Sources */}
            {frame > 140 && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                {["openai.com", "anthropic.com", "blog.google"].map((source, i) => (
                  <span
                    key={source}
                    style={{
                      padding: "4px 10px",
                      background: "rgba(16, 185, 129, 0.1)",
                      borderRadius: 10,
                      color: "#10b981",
                      fontSize: 11,
                      opacity: interpolate(frame, [140 + i * 10, 155 + i * 10], [0, 1], { extrapolateRight: "clamp" }),
                    }}
                  >
                    {source}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            gap: 10,
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 18,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Type your message...
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 5: FEATURES - What's Included (4s)
// ==========================================
const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const features = [
    { icon: "🔐", title: "Clerk Auth", desc: "OAuth, email, magic links" },
    { icon: "💬", title: "Streaming UI", desc: "Real-time chat interface" },
    { icon: "🔍", title: "Web Search", desc: "Toggle search on/off" },
    { icon: "💾", title: "PostgreSQL", desc: "Prisma + chat history" },
    { icon: "🎨", title: "shadcn/ui", desc: "Beautiful components" },
    { icon: "🚀", title: "Vercel Ready", desc: "One-click deploy" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        padding: 60,
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "white",
          marginBottom: 50,
          textAlign: "center",
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 30}px)`,
        }}
      >
        Everything you need,{" "}
        <span style={{ color: "#10b981" }}>pre-built</span>
      </h2>

      {/* Features grid - 3x2 for horizontal */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          width: "100%",
          maxWidth: 1100,
        }}
      >
        {features.map((feature, index) => {
          const featureProgress = spring({
            frame: frame - 15 - index * 8,
            fps,
            config: { damping: 20, stiffness: 200 },
            durationInFrames: 25,
          });

          return (
            <div
              key={index}
              style={{
                padding: "28px 24px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 18,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                opacity: featureProgress,
                transform: `scale(${0.9 + featureProgress * 0.1}) translateY(${(1 - featureProgress) * 25}px)`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{feature.icon}</div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  margin: "0 0 6px 0",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "#94a3b8",
                  margin: 0,
                }}
              >
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom highlight */}
      <div
        style={{
          marginTop: 45,
          padding: "16px 32px",
          background: "rgba(16, 185, 129, 0.1)",
          borderRadius: 30,
          border: "1px solid rgba(16, 185, 129, 0.2)",
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <span style={{ color: "#10b981", fontSize: 20, fontWeight: 700 }}>
          Save 120+ hours of development
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 6: CTA - Call to Action (4s)
// ==========================================
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
    durationInFrames: 30,
  });

  // Pulsing animation
  const pulseLoop = (frame - 30) % 25;
  const pulse = interpolate(pulseLoop, [0, 12, 25], [1, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        padding: 60,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 60%)",
          transform: `scale(${1 + entrance * 0.3})`,
          opacity: 0.8,
        }}
      />

      {/* Content */}
      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          opacity: entrance,
          transform: `translateY(${(1 - entrance) * 40}px)`,
        }}
      >
        {/* Price tag */}
        <div
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            borderRadius: 12,
            transform: "rotate(-2deg)",
            marginBottom: 30,
            boxShadow: "0 8px 30px rgba(239, 68, 68, 0.4)",
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Limited Time Offer
          </span>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "white",
            margin: "0 0 25px 0",
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            lineHeight: 1.15,
          }}
        >
          Ready to ship your <span style={{ color: "#10b981" }}>AI agent?</span>
        </h1>

        {/* Pricing */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 20,
            marginBottom: 25,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "white",
            }}
          >
            $239
          </span>
          <span
            style={{
              fontSize: 32,
              color: "#64748b",
              textDecoration: "line-through",
            }}
          >
            $299
          </span>
        </div>

        <p
          style={{
            fontSize: 20,
            color: "#94a3b8",
            marginBottom: 35,
          }}
        >
          White-label license • One-time payment • Lifetime updates
        </p>

        {/* CTA Button */}
        <div
          style={{
            display: "inline-block",
            padding: "26px 52px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: 18,
            transform: `scale(${pulse})`,
            boxShadow: "0 15px 50px rgba(16, 185, 129, 0.5)",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "white",
            }}
          >
            Get AgentKit Now →
          </span>
        </div>

        {/* URL */}
        <p
          style={{
            fontSize: 22,
            color: "#64748b",
            marginTop: 35,
            fontWeight: 600,
          }}
        >
          agentkit.dev
        </p>
      </div>

      {/* Floating elements */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 80,
          fontSize: 60,
          opacity: 0.5,
          transform: `translateY(${Math.sin(frame * 0.08) * 10}px)`,
        }}
      >
        🤖
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 80,
          fontSize: 60,
          opacity: 0.5,
          transform: `translateY(${Math.cos(frame * 0.08) * 10}px)`,
        }}
      >
        ⚡
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export const AgentKitHeroVideo: React.FC<AgentKitHeroVideoProps> = ({
  productName = "AgentKit",
  tagline = "Build AI agents in hours, not weeks",
}) => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 1: Hook - 3 seconds */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20 }, durationInFrames: 20 })}
        />

        {/* Scene 2: Problem - 4 seconds */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <ProblemScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 20 }, durationInFrames: 20 })}
        />

        {/* Scene 3: Use Cases - 5 seconds */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <UseCasesScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20 }, durationInFrames: 20 })}
        />

        {/* Scene 4: Demo - 6 seconds */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <DemoScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 20 }, durationInFrames: 20 })}
        />

        {/* Scene 5: Features - 4 seconds */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <FeaturesScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 20 }, durationInFrames: 20 })}
        />

        {/* Scene 6: CTA - 4 seconds */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Progress bar */}
      <ProgressBar />
    </AbsoluteFill>
  );
};

// Progress bar component
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
        background: "rgba(255, 255, 255, 0.1)",
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(frame / durationInFrames) * 100}%`,
          background: "linear-gradient(90deg, #10b981, #34d399)",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
        }}
      />
    </div>
  );
};
