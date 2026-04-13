/* eslint-disable @next/next/no-img-element */
"use client";

import { Play, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type AnimationStyle =
	| "from-bottom"
	| "from-center"
	| "from-top"
	| "from-left"
	| "from-right"
	| "fade"
	| "top-in-bottom-out"
	| "left-in-right-out";

interface HeroVideoProps {
	animationStyle?: AnimationStyle;
	videoSrc: string;
	thumbnailSrc?: string;
	thumbnailAlt?: string;
	className?: string;
}

const animationVariants = {
	"from-bottom": {
		initial: { y: "100%", opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: "100%", opacity: 0 },
	},
	"from-center": {
		initial: { scale: 0.5, opacity: 0 },
		animate: { scale: 1, opacity: 1 },
		exit: { scale: 0.5, opacity: 0 },
	},
	"from-top": {
		initial: { y: "-100%", opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: "-100%", opacity: 0 },
	},
	"from-left": {
		initial: { x: "-100%", opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: "-100%", opacity: 0 },
	},
	"from-right": {
		initial: { x: "100%", opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: "100%", opacity: 0 },
	},
	fade: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	},
	"top-in-bottom-out": {
		initial: { y: "-100%", opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: "100%", opacity: 0 },
	},
	"left-in-right-out": {
		initial: { x: "-100%", opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: "100%", opacity: 0 },
	},
};

export function HeroVideoDialog({
	animationStyle = "from-center",
	videoSrc,
	thumbnailSrc,
	thumbnailAlt = "Video thumbnail",
	className,
}: HeroVideoProps) {
	const [isVideoOpen, setIsVideoOpen] = useState(false);
	const selectedAnimation = animationVariants[animationStyle];

	return (
		<div className={cn("relative", className)}>
			<div
				className="group relative cursor-pointer"
				onClick={() => setIsVideoOpen(true)}
			>
				{thumbnailSrc ? (
					<div className="relative mx-auto aspect-[16/9] h-auto max-h-[80vh] w-full max-w-[1200px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800">
						<img
							src={thumbnailSrc}
							alt={thumbnailAlt}
							width={1920}
							height={1080}
							className="h-full w-full object-contain transition-all duration-200 ease-out group-hover:brightness-[0.8]"
						/>
						{/* Overlay gradient for better play button contrast */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
					</div>
				) : (
					<div className="relative mx-auto aspect-[16/9] h-auto max-h-[80vh] w-full max-w-[1200px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/20">
						{/* Animated background pattern */}
						<div className="absolute inset-0 opacity-20">
							<div className="absolute inset-0" style={{
								backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16,185,129,0.3) 1px, transparent 0)`,
								backgroundSize: '32px 32px'
							}} />
						</div>
						{/* Center content */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
									<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
										<circle cx="12" cy="12" r="3" />
										<path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
									</svg>
								</div>
								<p className="text-lg font-semibold text-white">AgentKit</p>
								<p className="text-sm text-slate-400">Watch Demo</p>
							</div>
						</div>
					</div>
				)}
				<div className="absolute inset-0 isolate flex scale-[0.9] items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
					<div className="flex size-28 items-center justify-center rounded-full bg-gradient-to-t from-secondary/20 to-[#ACC3F7/15] backdrop-blur-md">
						<div
							className={`relative flex size-20 scale-100 items-center justify-center rounded-full bg-gradient-to-t from-secondary to-white/10 shadow-md transition-all duration-200 ease-out group-hover:scale-[1.2]`}
						>
							<Play
								className="size-8 scale-100 fill-white text-white transition-transform duration-200 ease-out group-hover:scale-105"
								style={{
									filter:
										"drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
								}}
							/>
						</div>
					</div>
				</div>
			</div>
			<AnimatePresence>
				{isVideoOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						onClick={() => setIsVideoOpen(false)}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
					>
						<motion.div
							{...selectedAnimation}
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
							className="relative mx-auto aspect-[16/9] h-auto max-h-[80vh] w-full max-w-[1200px] rounded-2xl"
						>
							<motion.button
								className="absolute -top-16 right-0 cursor-pointer rounded-full bg-neutral-900/50 p-2 text-white text-xl ring-1 backdrop-blur-md transition-all duration-200 ease-out hover:scale-[98%] dark:bg-neutral-100/50 dark:text-black"
								onClick={() => setIsVideoOpen(false)}
							>
								<XIcon className="size-5" />
							</motion.button>
							<div className="relative isolate z-[1] h-full w-full overflow-hidden rounded-2xl border-2 border-white bg-black">
								{videoSrc.includes("youtube.com") || videoSrc.includes("youtu.be") ? (
									<iframe
										src={videoSrc}
										className="h-full w-full"
										allowFullScreen
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									/>
								) : (
									<video
										src={videoSrc}
										className="h-full w-full object-contain"
										controls
										autoPlay
										playsInline
										controlsList="nodownload"
									/>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
