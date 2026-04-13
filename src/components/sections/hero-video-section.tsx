"use client";

import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

export function HeroVideoSection() {
	return (
		<div className="relative mt-10 flex justify-center px-6">
			<div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.08),0_16px_32px_rgba(0,0,0,0.12)] transition-shadow duration-500 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.12),0_24px_48px_rgba(0,0,0,0.16)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_4px_12px_rgba(0,0,0,0.3),0_16px_32px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_8px_24px_rgba(0,0,0,0.4),0_24px_48px_rgba(0,0,0,0.5)]">
				<HeroVideoDialog
					className="block dark:hidden"
					animationStyle="from-center"
					videoSrc="/agentkit-hero-video.mp4"
					thumbnailSrc="/hero-light.svg"
					thumbnailAlt="AgentKit Product Demo"
				/>
				<HeroVideoDialog
					className="hidden dark:block"
					animationStyle="from-center"
					videoSrc="/agentkit-hero-video.mp4"
					thumbnailSrc="/hero-dark.svg"
					thumbnailAlt="AgentKit Product Demo"
				/>
			</div>
		</div>
	);
}
