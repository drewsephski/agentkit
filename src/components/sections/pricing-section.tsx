"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

// Glassmorphism button style matching the "Try For Free" navbar button
const glassmorphismButton =
	"h-10 w-full rounded-full border border-border bg-secondary px-4 font-medium text-sm text-secondary-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-accent active:scale-95 dark:border-white/[0.12] dark:bg-white/[0.08] dark:text-foreground dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] dark:hover:bg-white/[0.12]";

// Primary CTA button with the main green accent
const primaryButton =
	"h-10 w-full rounded-full bg-primary px-4 font-medium text-sm text-primary-foreground shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] transition-all duration-200 hover:bg-primary/90 hover:shadow-lg active:scale-95";

interface TabsProps {
	activeTab: "yearly" | "monthly";
	setActiveTab: (tab: "yearly" | "monthly") => void;
	className?: string;
}

function PricingTabs({ activeTab, setActiveTab, className }: TabsProps) {
	return (
		<div
			className={cn(
				"relative flex h-9 w-fit cursor-pointer flex-row items-center rounded-full border border-border bg-muted p-0.5 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]",
				className,
			)}
		>
			{["monthly", "yearly"].map((tab) => (
				<button
					key={tab}
					onClick={() => setActiveTab(tab as "yearly" | "monthly")}
					className={cn(
						"relative z-[1] flex h-8 cursor-pointer items-center justify-center px-2",
						{
							"z-0": activeTab === tab,
						},
					)}
				>
					{activeTab === tab && (
						<motion.div
							layoutId="active-tab"
							className="absolute inset-0 rounded-full border border-border bg-accent shadow-md dark:border-white/[0.12] dark:bg-white/[0.1]"
							transition={{
								duration: 0.2,
								type: "spring",
								stiffness: 300,
								damping: 25,
								velocity: 2,
							}}
						/>
					)}
					<span
						className={cn(
							"relative block shrink-0 font-medium text-sm duration-200",
							activeTab === tab ? "text-foreground" : "text-muted-foreground",
						)}
					>
						{tab.charAt(0).toUpperCase() + tab.slice(1)}
						{tab === "yearly" && (
							<span className="ml-2 whitespace-nowrap rounded-full bg-primary/20 px-1.5 py-0.5 font-semibold text-xs text-primary">
								-20%
							</span>
						)}
					</span>
				</button>
			))}
		</div>
	);
}

export function PricingSection() {
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"monthly",
	);
	const router = useRouter();

	// Simple price display - no animation
	const PriceDisplay = ({
		tier,
	}: {
		tier: (typeof siteConfig.pricing.pricingItems)[0];
	}) => {
		const price = billingCycle === "yearly" ? tier.yearlyPrice : tier.price;
		return (
			<span className="font-semibold text-4xl">{price}</span>
		);
	};

	return (
		<section
			id="pricing"
			className="relative flex w-full flex-col items-center justify-center gap-10 pb-10"
		>
			<SectionHeader>
				<h2 className="text-balance text-center font-medium text-3xl tracking-tighter md:text-4xl">
					{siteConfig.pricing.title}
				</h2>
				<p className="text-balance text-center font-medium text-muted-foreground">
					{siteConfig.pricing.description}
				</p>
			</SectionHeader>
			<div className="relative h-full w-full">
				<div className="absolute -top-14 left-1/2 -translate-x-1/2">
					<PricingTabs
						activeTab={billingCycle}
						setActiveTab={setBillingCycle}
						className="mx-auto"
					/>
				</div>

				<div className="mx-auto grid w-full max-w-6xl gap-4 px-6 min-[650px]:grid-cols-2 min-[900px]:grid-cols-3">
					{siteConfig.pricing.pricingItems.map((tier) => (
						<motion.div
							key={tier.name}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className={cn(
								"relative grid h-fit overflow-hidden rounded-xl min-[650px]:h-full min-[900px]:h-fit",
								billingCycle === "yearly" ? "grid-rows-[200px_auto_1fr]" : "grid-rows-[180px_auto_1fr]",
								tier.isPopular
									? "border border-border bg-card shadow-lg backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.05] dark:shadow-[0px_61px_24px_-10px_rgba(0,0,0,0.01),0px_34px_20px_-8px_rgba(0,0,0,0.05),0px_15px_15px_-6px_rgba(0,0,0,0.09),0px_4px_8px_-2px_rgba(0,0,0,0.10)]"
									: "border border-border bg-muted/50 backdrop-blur-sm dark:border-white/[0.06] dark:bg-black/[0.3]",
							)}
						>
							<div className="flex flex-col gap-4 p-5">
								<div className="flex items-center gap-2">
									<p className="font-semibold text-foreground text-sm tracking-wide">
										{tier.name}
									</p>
									{tier.isPopular && (
										<span className="inline-flex h-6 w-fit items-center justify-center rounded-full bg-primary px-2.5 font-semibold text-[10px] text-primary-foreground uppercase tracking-wider shadow-md shadow-primary/20 dark:shadow-[0px_2px_4px_rgba(0,217,146,0.3)]">
											Popular
										</span>
									)}
								</div>
								<div className="mt-1 flex items-baseline">
									<PriceDisplay tier={tier} />
									<span className="ml-2 font-medium text-muted-foreground">
										/{billingCycle === "yearly" ? "year" : "month"}
									</span>
								</div>
								{billingCycle === "yearly" && tier.name !== "Free" && (
									<p className="mt-1 text-xs text-primary font-medium">
										Save ~17% vs monthly
									</p>
								)}
								<p className={cn(
									"mt-1 font-medium text-muted-foreground text-sm leading-relaxed",
									billingCycle === "yearly" && "mb-6"
								)}>
									{tier.description}
								</p>
							</div>

							<div className="flex flex-col gap-2 p-5 pt-0">
								<button
									className={cn(
										"flex cursor-pointer items-center justify-center",
										tier.isPopular ? primaryButton : glassmorphismButton,
									)}
									onClick={() => router.push("/pricing")}
								>
									{tier.buttonText}
								</button>
							</div>
							<hr className="border-border dark:border-white/[0.08]" />
							<div className="p-5">
								{tier.name !== "Free" && (
									<p className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
										Everything in {tier.name === "Startup" ? "Free" : "Startup"}{" "}
										+
									</p>
								)}
								<ul className="space-y-3">
									{tier.features.map((feature) => (
										<li key={feature} className="flex items-center gap-3">
											<div
												className={cn(
													"flex size-5 items-center justify-center rounded-full border",
													tier.isPopular
														? "border-primary/30 bg-primary/10"
														: "border-border bg-muted dark:border-white/[0.15] dark:bg-white/[0.05]",
												)}
											>
												<div className="flex size-3 items-center justify-center">
													<svg
														width="8"
														height="7"
														viewBox="0 0 8 7"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M1.5 3.48828L3.375 5.36328L6.5 0.988281"
															stroke={tier.isPopular ? "var(--primary)" : "var(--muted-foreground)"}
															strokeWidth="1.5"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												</div>
											</div>
											<span className="font-medium text-foreground/90 text-sm">
												{feature}
											</span>
										</li>
									))}
								</ul>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
