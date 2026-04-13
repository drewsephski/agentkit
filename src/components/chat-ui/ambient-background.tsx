"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
	className?: string;
	isStreaming?: boolean;
}

// Floating orb that drifts slowly
function FloatingOrb({
	delay,
	duration,
	size,
	opacity,
	color,
	startX,
	startY,
}: {
	delay: number;
	duration: number;
	size: number;
	opacity: number;
	color: string;
	startX: string;
	startY: string;
}) {
	return (
		<motion.div
			className={cn("pointer-events-none absolute rounded-full blur-3xl", color)}
			style={{
				width: size,
				height: size,
				opacity,
				left: startX,
				top: startY,
			}}
			animate={{
				x: [0, 100, -50, 0],
				y: [0, -80, 50, 0],
				scale: [1, 1.1, 0.9, 1],
			}}
			transition={{
				duration,
				ease: "easeInOut",
				repeat: Infinity,
				delay,
			}}
		/>
	);
}

// Particle that moves along a path
function Particle({
	delay,
	speed,
	color,
}: {
	delay: number;
	speed: number;
	color: string;
}) {
	const pathVariants = {
		hidden: { pathLength: 0, opacity: 0 },
		visible: {
			pathLength: 1,
			opacity: [0, 1, 1, 0],
			transition: {
				pathLength: { duration: speed, ease: "easeInOut" },
				opacity: { duration: speed, times: [0, 0.1, 0.9, 1] },
				repeat: Infinity,
				delay,
			},
		},
	};

	// Random curved path
	const startX = Math.random() * 100;
	const startY = Math.random() * 100;
	const midX = Math.random() * 100;
	const midY = Math.random() * 100;
	const endX = Math.random() * 100;
	const endY = Math.random() * 100;
	
	const path = `M ${startX}% ${startY}% Q ${midX}% ${midY}% ${endX}% ${endY}%`;

	return (
		<svg
			className="pointer-events-none absolute inset-0 h-full w-full"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
		>
			<motion.path
				d={path}
				fill="none"
				stroke={color}
				strokeWidth="0.5"
				strokeLinecap="round"
				variants={pathVariants}
				initial="hidden"
				animate="visible"
			/>
		</svg>
	);
}

// Pulsing ring effect
function PulseRing({
	delay,
	isActive,
}: {
	delay: number;
	isActive: boolean;
}) {
	if (!isActive) return null;

	return (
		<motion.div
			className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
			initial={{ width: 0, height: 0, opacity: 1 }}
			animate={{
				width: [0, 400, 600],
				height: [0, 400, 600],
				opacity: [1, 0.3, 0],
			}}
			transition={{
				duration: 3,
				ease: "easeOut",
				repeat: Infinity,
				delay,
			}}
		/>
	);
}

export function AmbientBackground({
	className,
	isStreaming = false,
}: AmbientBackgroundProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<div
			className={cn(
				"pointer-events-none fixed inset-0 -z-10 overflow-hidden",
				className
			)}
		>
			{/* Gradient base */}
			<div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/50" />

			{/* Floating orbs */}
			<FloatingOrb
				delay={0}
				duration={20}
				size={300}
				opacity={0.03}
				color="bg-primary"
				startX="10%"
				startY="20%"
			/>
			<FloatingOrb
				delay={5}
				duration={25}
				size={400}
				opacity={0.02}
				color="bg-secondary"
				startX="70%"
				startY="60%"
			/>
			<FloatingOrb
				delay={10}
				duration={18}
				size={250}
				opacity={0.04}
				color="bg-accent"
				startX="30%"
				startY="80%"
			/>

			{/* Pulse rings when streaming */}
			{isStreaming && (
				<>
					<PulseRing delay={0} isActive={isStreaming} />
					<PulseRing delay={1} isActive={isStreaming} />
					<PulseRing delay={2} isActive={isStreaming} />
				</>
			)}

			{/* Subtle grid pattern */}
			<div
				className="absolute inset-0 opacity-[0.015]"
				style={{
					backgroundImage: `
						linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
						linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
					`,
					backgroundSize: "60px 60px",
				}}
			/>
		</div>
	);
}

// Simpler ambient effect for message containers
export function MessageAmbient({ isActive }: { isActive: boolean }) {
	return (
		<AnimatePresence>
			{isActive && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="absolute inset-0 -z-10 overflow-hidden rounded-lg"
				>
					{/* Subtle glow effect */}
					<motion.div
						className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5"
						animate={{
							opacity: [0.3, 0.6, 0.3],
						}}
						transition={{
							duration: 2,
							ease: "easeInOut",
							repeat: Infinity,
						}}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
