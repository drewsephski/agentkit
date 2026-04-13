"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { HeroVideoSection } from "@/components/sections/hero-video-section";
import { siteConfig } from "@/lib/config";

export function HeroSection() {
	const { hero } = siteConfig;

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: [0.16, 1, 0.3, 1],
			},
		},
	};

	return (
		<section id="hero" className="relative w-full overflow-hidden">
			<div className="relative flex w-full flex-col items-center px-6">
				<div className="absolute inset-0">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
						className="absolute inset-0 -z-10 h-[600px] w-full rounded-b-xl bg-gradient-radial from-[var(--primary)]/5 via-transparent to-transparent md:h-[800px]"
					/>
				</div>
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center gap-10 pt-32"
				>
					<motion.p
						variants={itemVariants}
						className="flex h-8 items-center gap-2 rounded-full bg-primary px-4 font-medium text-primary-foreground text-sm backdrop-blur-sm"
					>
						{hero.badgeIcon}
						{hero.badge}
					</motion.p>
					<motion.div
						variants={itemVariants}
						className="flex flex-col items-center justify-center gap-5"
					>
						<h1 className="text-balance text-center font-semibold text-3xl text-foreground tracking-tight md:text-4xl lg:text-5xl xl:text-6xl">
							{hero.title}
						</h1>
						<p className="max-w-xl text-balance text-center font-medium text-base text-muted-foreground leading-relaxed tracking-tight md:text-lg">
							{hero.description}
						</p>
					</motion.div>
					<motion.div
						variants={itemVariants}
						className="flex flex-row items-center justify-center gap-3"
					>
						{/* Primary CTA - Enhanced emerald glow */}
						<Link
							href={hero.cta.primary.href}
							className="group relative flex h-11 items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full bg-[var(--primary)] px-7 font-semibold text-[var(--primary-foreground)] text-sm shadow-[0_0_0_1px_rgba(0,168,107,0.2)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/25 before:to-transparent before:opacity-100 after:absolute after:inset-0 after:-z-10 after:rounded-full after:bg-[var(--primary)] after:opacity-0 after:blur-xl after:transition-opacity after:duration-500 hover:shadow-[0_0_0_1px_rgba(0,168,107,0.3),0_0_40px_rgba(0,168,107,0.2)] hover:after:opacity-50 active:scale-[0.98] dark:text-[var(--background)] dark:before:from-white/20 dark:shadow-[0_0_0_1px_rgba(0,217,146,0.2)] dark:after:opacity-0 dark:hover:shadow-[0_0_0_1px_rgba(0,217,146,0.3),0_0_60px_rgba(0,217,146,0.35)] dark:hover:after:opacity-70"
						>
							{/* Outer glow ring */}
							<span className="absolute -inset-[2px] rounded-full opacity-0 shadow-[0_0_24px_rgba(0,168,107,0.35),0_0_48px_rgba(0,168,107,0.15)] transition-all duration-500 group-hover:opacity-100 dark:shadow-[0_0_32px_rgba(0,217,146,0.45),0_0_64px_rgba(0,217,146,0.25)]" />
							{/* Inner edge glow */}
							<span className="absolute -inset-px rounded-full opacity-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] transition-opacity duration-500 group-hover:opacity-100" />
							<span className="relative flex items-center gap-2.5">
								{/* Play icon */}
								<svg
									className="h-4 w-4 fill-current"
									viewBox="0 0 24 24"
								>
									<path d="M8 5v14l11-7z" />
								</svg>
								<span>{hero.cta.primary.text}</span>
							</span>
						</Link>

						{/* Secondary CTA - Sophisticated ghost */}
						<Link
							href={hero.cta.secondary.href}
							className="group relative flex h-11 items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--background)]/50 px-7 font-medium text-[var(--foreground)] text-sm backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--muted-foreground)]/30 hover:bg-[var(--muted)]/80 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] dark:hover:border-[var(--muted-foreground)]/40 dark:hover:bg-[var(--secondary)]/50 dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
						>
							{/* GitHub icon */}
							<svg
								className="h-4 w-4 fill-current"
								viewBox="0 0 24 24"
							>
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							<span>{hero.cta.secondary.text}</span>
						</Link>
					</motion.div>
				</motion.div>
			</div>
			<HeroVideoSection />
		</section>
	);
}
