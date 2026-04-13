import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Geist";

const { fontFamily } = loadFont();

interface AgentKitShortProps {
  productName: string;
  tagline: string;
}

export const AgentKitShort: React.FC<AgentKitShortProps> = ({
  productName,
  tagline,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  // Features appear with stagger
  const feature1 = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
    durationInFrames: 35,
  });

  const feature2 = spring({
    frame: frame - 45,
    fps,
    config: { damping: 200 },
    durationInFrames: 35,
  });

  const feature3 = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 },
    durationInFrames: 35,
  });

  // CTA animation
  const ctaProgress = spring({
    frame: frame - 150,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
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
            width: 100,
            height: 100,
            borderRadius: 24,
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)",
          }}
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          margin: "0 0 16px 0",
          textAlign: "center",
          transform: `translateY(${(1 - entrance) * 20}px)`,
          opacity: entrance,
        }}
      >
        {productName}
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: 28,
          color: "#94a3b8",
          margin: "0 0 50px 0",
          textAlign: "center",
          opacity: interpolate(frame, [20, 40], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {tagline}
      </p>

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 500,
        }}
      >
        {[
          { icon: "🔍", text: "Web Search Toggle", progress: feature1 },
          { icon: "🔐", text: "Built-in Authentication", progress: feature2 },
          { icon: "⚡", text: "Streaming Responses", progress: feature3 },
        ].map((feature, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 24px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              opacity: feature.progress,
              transform: `translateX(${(1 - feature.progress) * 40}px)`,
            }}
          >
            <span style={{ fontSize: 28 }}>{feature.icon}</span>
            <span
              style={{
                fontSize: 22,
                color: "white",
                fontWeight: 600,
              }}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          marginTop: 50,
          opacity: ctaProgress,
          transform: `translateY(${(1 - ctaProgress) * 30}px)`,
        }}
      >
        <div
          style={{
            padding: "20px 40px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: 16,
            color: "white",
            fontSize: 24,
            fontWeight: 700,
            boxShadow: "0 10px 40px rgba(16, 185, 129, 0.4)",
          }}
        >
          Get it for $239 →
        </div>
        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: 16,
            marginTop: 12,
          }}
        >
          agentkit.dev
        </p>
      </div>

      {/* Progress bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(frame / 600) * 100}%`,
            background: "#10b981",
            transition: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
