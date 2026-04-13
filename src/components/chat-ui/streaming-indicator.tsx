"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface StreamingIndicatorProps {
	className?: string;
	variant?: "default" | "compact" | "minimal";
}

export function StreamingIndicator({
	className,
	variant = "default",
}: StreamingIndicatorProps) {
	// Enterprise-grade compact variant - subtle pulsing dots
	if (variant === "compact") {
		return (
			<div className={cn("flex items-center gap-1.5", className)}>
				{[0, 1, 2].map((i) => (
					<motion.div
						key={i}
						className="h-1.5 w-1.5 rounded-full bg-primary/70"
						animate={{
							opacity: [0.4, 0.8, 0.4],
						}}
						transition={{
							duration: 1.4,
							ease: [0.4, 0, 0.2, 1],
							repeat: Infinity,
							delay: i * 0.2,
						}}
					/>
				))}
			</div>
		);
	}

	// Minimal variant - single elegant pulse
	if (variant === "minimal") {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				<motion.div
					className="h-2 w-2 rounded-full bg-primary/60"
					animate={{
						opacity: [0.4, 1, 0.4],
						scale: [1, 1.05, 1],
					}}
					transition={{
						duration: 2,
						ease: [0.4, 0, 0.2, 1],
						repeat: Infinity,
					}}
				/>
				<span className="text-xs font-medium text-muted-foreground/80 tracking-wide">
					Processing
				</span>
			</div>
		);
	}

	// Default variant - professional typing indicator
	return (
		<div className={cn("flex items-center gap-3", className)}>
			<div className="flex items-center gap-1">
				{[0, 1, 2].map((i) => (
					<motion.div
						key={i}
						className="h-1.5 w-1.5 rounded-full bg-primary/60"
						animate={{
							opacity: [0.3, 0.7, 0.3],
						}}
						transition={{
							duration: 1.6,
							ease: [0.4, 0, 0.2, 1],
							repeat: Infinity,
							delay: i * 0.15,
						}}
					/>
				))}
			</div>
			<span className="text-xs font-medium text-muted-foreground/80 tracking-wide">
				Generating response
			</span>
		</div>
	);
}

// Subtle cursor for streaming text - professional blink
export function StreamingCursor() {
	return (
		<motion.span
			className="ml-0.5 inline-block h-4 w-[2px] bg-primary/60 align-middle"
			animate={{ opacity: [1, 0.3, 1] }}
			transition={{
				duration: 1,
				ease: "easeInOut",
				repeat: Infinity,
			}}
		/>
	);
}

// Status indicator for active processing - no rotation
export function WorkingOrb({ className }: { className?: string }) {
	return (
		<div className={cn("relative flex items-center justify-center", className)}>
			{/* Subtle pulse ring */}
			<motion.div
				className="absolute inset-0 rounded-full border border-white/20"
				animate={{
					scale: [1, 1.3],
					opacity: [0.6, 0],
				}}
				transition={{
					duration: 2,
					ease: [0.4, 0, 0.2, 1],
					repeat: Infinity,
				}}
			/>
			{/* Solid core */}
			<motion.div
				className="h-2 w-2 rounded-full bg-primary/70"
				animate={{
					opacity: [0.6, 1, 0.6],
				}}
				transition={{
					duration: 2,
					ease: [0.4, 0, 0.2, 1],
					repeat: Infinity,
				}}
			/>
		</div>
	);
}
