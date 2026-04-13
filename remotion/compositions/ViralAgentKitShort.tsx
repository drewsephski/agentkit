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

interface ViralAgentKitShortProps {
  productName?: string;
  tagline?: string;
}

// Hook scene - First 2 seconds with explosive impact
const HookScene: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Explosive entrance
  const scale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 300, mass: 0.8 },
    durationInFrames: 25,
  });

  // Flash effect
  const flashOpacity = interpolate(frame, [0, 5, 10], [1, 0.3, 0], {
    extrapolateRight: "clamp",
  });

  // Text reveal with stagger
  const words = text.split(" ");

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
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
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Background grid animation */}
      <div
        style={{
          position: "absolute",
          inset: -100,
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transform: `rotate(${frame * 0.2}deg) scale(${1.5 + scale * 0.5})`,
          opacity: 0.5,
        }}
      />

      {/* Main text with word-by-word reveal */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 16px",
          padding: "0 40px",
          maxWidth: 900,
        }}
      >
        {words.map((word, index) => {
          const wordProgress = spring({
            frame: frame - index * 3,
            fps,
            config: { damping: 20, stiffness: 250 },
            durationInFrames: 20,
          });

          return (
            <span
              key={index}
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: index === 0 || index === words.length - 1 ? "#10b981" : "white",
                textTransform: "uppercase",
                transform: `scale(${0.8 + wordProgress * 0.2}) translateY(${(1 - wordProgress) * 50}px)`,
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

      {/* Pulse ring */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: "4px solid #10b981",
          transform: `scale(${1 + scale * 2})`,
          opacity: 1 - scale,
        }}
      />
    </AbsoluteFill>
  );
};

// Pain point scene - Red X marks
const PainPointScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const painPoints = [
    { text: "120+ Hours Coding", icon: "⏰" },
    { text: "Complex Auth Setup", icon: "🔐" },
    { text: "Chat UI From Scratch", icon: "💬" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        padding: 40,
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
          transform: `translateY(${interpolate(frame, [0, 20], [30, 0], { extrapolateRight: "clamp" })}px)`,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Building AI agents means:
      </h2>

      {/* Pain points with X marks */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
          maxWidth: 600,
        }}
      >
        {painPoints.map((point, index) => {
          const pointProgress = spring({
            frame: frame - 15 - index * 10,
            fps,
            config: { damping: 20, stiffness: 200 },
            durationInFrames: 30,
          });

          const shake = interpolate(
            frame,
            [30 + index * 10, 35 + index * 10, 40 + index * 10],
            [0, 10, 0],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "24px 32px",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: 16,
                border: "2px solid rgba(239, 68, 68, 0.3)",
                transform: `translateX(${(1 - pointProgress) * -100}px) translateX(${shake}px)`,
                opacity: pointProgress,
              }}
            >
              <span style={{ fontSize: 40 }}>{point.icon}</span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  flex: 1,
                }}
              >
                {point.text}
              </span>
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

      {/* Frustrated emoji overlay */}
      <div
        style={{
          position: "absolute",
          fontSize: 120,
          opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" }),
          transform: `scale(${spring({ frame: frame - 50, fps, config: { damping: 10 } })})`,
          filter: "grayscale(1)",
        }}
      >
        😤
      </div>
    </AbsoluteFill>
  );
};

// Solution scene - Green checkmarks with celebration
const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const solutions = [
    { text: "Deploy in 5 Minutes", icon: "🚀", highlight: "5 MIN" },
    { text: "Pre-built Auth", icon: "✅", highlight: "DONE" },
    { text: "Web Search Ready", icon: "🔍", highlight: "ON" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #064e3b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        padding: 40,
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: "white",
          marginBottom: 40,
          textAlign: "center",
          textShadow: "0 0 40px rgba(16, 185, 129, 0.5)",
        }}
      >
        AgentKit changes everything
      </h2>

      {/* Solutions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: "100%",
          maxWidth: 600,
        }}
      >
        {solutions.map((solution, index) => {
          const solutionProgress = spring({
            frame: frame - 10 - index * 8,
            fps,
            config: { damping: 15, stiffness: 250 },
            durationInFrames: 25,
          });

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "24px 32px",
                background: "rgba(16, 185, 129, 0.15)",
                borderRadius: 16,
                border: "2px solid rgba(16, 185, 129, 0.4)",
                boxShadow: "0 0 30px rgba(16, 185, 129, 0.2)",
                transform: `translateX(${(1 - solutionProgress) * 100}px) scale(${0.9 + solutionProgress * 0.1})`,
                opacity: solutionProgress,
              }}
            >
              <span style={{ fontSize: 40 }}>{solution.icon}</span>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "white",
                  flex: 1,
                }}
              >
                {solution.text}
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.2)",
                  padding: "8px 16px",
                  borderRadius: 8,
                  transform: `scale(${solutionProgress})`,
                }}
              >
                {solution.highlight}
              </span>
            </div>
          );
        })}
      </div>

      {/* Celebration particles */}
      {[...Array(8)].map((_, i) => {
        const particleProgress = interpolate(
          frame,
          [30 + i * 5, 60 + i * 5],
          [0, 1],
          { extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              fontSize: 40,
              opacity: 1 - particleProgress,
              transform: `translate(
                ${Math.sin(i * 0.8) * 150 * particleProgress}px,
                ${-200 * particleProgress}px
              )`,
              left: `${50 + Math.sin(i) * 30}%`,
              top: "60%",
            }}
          >
            {["✨", "🎉", "⭐", "💚"][i % 4]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// CTA Scene - Final punch with price
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
    durationInFrames: 30,
  });

  // Create a looping pulse animation
  const pulseLoop = (frame - 30) % 30;
  const pulse = interpolate(pulseLoop, [0, 15, 30], [1, 1.1, 1], {
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
      }}
    >
      {/* Animated background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 60%)",
          transform: `scale(${1 + entrance * 0.5})`,
          opacity: 0.8,
        }}
      />

      {/* Main content */}
      <div
        style={{
          textAlign: "center",
          transform: `scale(${entrance})`,
          opacity: entrance,
          zIndex: 1,
        }}
      >
        {/* Price tag */}
        <div
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            borderRadius: 12,
            transform: `rotate(-3deg) scale(${pulse})`,
            marginBottom: 30,
            boxShadow: "0 10px 40px rgba(239, 68, 68, 0.4)",
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Limited Time: $239
          </span>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "white",
            margin: "0 0 20px 0",
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            lineHeight: 1.1,
          }}
        >
          Build AI Agents
          <br />
          <span style={{ color: "#10b981" }}>In Hours, Not Weeks</span>
        </h1>

        {/* CTA Button */}
        <div
          style={{
            display: "inline-block",
            padding: "24px 48px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: 16,
            marginTop: 30,
            transform: `scale(${pulse})`,
            boxShadow: "0 20px 60px rgba(16, 185, 129, 0.5)",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "white",
            }}
          >
            Get AgentKit →
          </span>
        </div>

        {/* URL */}
        <p
          style={{
            fontSize: 24,
            color: "#64748b",
            marginTop: 30,
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
          top: 40,
          right: 40,
          fontSize: 60,
          opacity: 0.6,
          transform: `translateY(${Math.sin(frame * 0.1) * 10}px)`,
        }}
      >
        🤖
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 40,
          fontSize: 60,
          opacity: 0.6,
          transform: `translateY(${Math.cos(frame * 0.1) * 10}px)`,
        }}
      >
        ⚡
      </div>
    </AbsoluteFill>
  );
};

// Scene wrapper components to handle transitions
const SceneWrapper: React.FC<{
  showStart: number;
  showEnd?: number;
  fadeStart?: number;
  fadeEnd?: number;
  children: React.ReactNode;
}> = ({ showStart, showEnd, fadeStart, fadeEnd, children }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    fadeStart !== undefined && fadeEnd !== undefined
      ? [showStart, fadeStart, fadeEnd, showEnd ?? fadeEnd]
      : [showStart, showStart + 10],
    fadeStart !== undefined && fadeEnd !== undefined
      ? [0, 1, 1, 0]
      : [0, 1],
    { extrapolateRight: "clamp" }
  );

  if (showEnd !== undefined && frame >= showEnd) return null;
  if (frame < showStart) return null;

  return <div style={{ opacity }}>{children}</div>;
};

// Main viral short component
export const ViralAgentKitShort: React.FC<ViralAgentKitShortProps> = ({
  productName = "AgentKit",
  tagline = "Build AI agents in hours, not weeks",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Scene 1: Hook - 2 seconds (60 frames) */}
      {frame < 60 && <HookScene text="Stop Wasting Time Building AI Agents From Scratch" />}

      {/* Scene 2: Pain Points - 3 seconds (90 frames) */}
      <SceneWrapper showStart={50} showEnd={140} fadeStart={60} fadeEnd={130}>
        <PainPointScene />
      </SceneWrapper>

      {/* Scene 3: Solution - 3 seconds (90 frames) */}
      <SceneWrapper showStart={130} showEnd={220} fadeStart={140} fadeEnd={210}>
        <SolutionScene />
      </SceneWrapper>

      {/* Scene 4: CTA - 3.5 seconds (105 frames) */}
      <SceneWrapper showStart={210} fadeStart={220}>
        <CTAScene />
      </SceneWrapper>

      {/* Progress bar */}
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
            width: `${(frame / 315) * 100}%`,
            background: "linear-gradient(90deg, #10b981, #34d399)",
            boxShadow: "0 0 20px #10b981",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
