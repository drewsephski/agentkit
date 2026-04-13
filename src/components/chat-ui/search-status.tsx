"use client";

import { motion, AnimatePresence } from "motion/react";
import { Globe, Search, Check, Sparkles, ArrowRight, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SearchStep {
	id: string;
	label: string;
	icon: React.ReactNode;
	status: "pending" | "active" | "completed";
}

interface SearchStatusProps {
	query: string;
	resultsCount: number;
	isSearching: boolean;
	isSummarizing: boolean;
	className?: string;
}

export function SearchStatus({
	query,
	resultsCount,
	isSearching,
	isSummarizing,
	className,
}: SearchStatusProps) {
	const [steps, setSteps] = useState<SearchStep[]>([
		{ id: "search", label: "Searching web", icon: <Search className="h-3.5 w-3.5" />, status: "active" },
		{ id: "results", label: "Analyzing results", icon: <Globe className="h-3.5 w-3.5" />, status: "pending" },
		{ id: "summarize", label: "Synthesizing answer", icon: <Sparkles className="h-3.5 w-3.5" />, status: "pending" },
	]);

	useEffect(() => {
		setSteps((prev) => {
			const newSteps = [...prev];
			
			if (isSearching) {
				newSteps[0] = { ...newSteps[0], status: "active" };
				newSteps[1] = { ...newSteps[1], status: "pending" };
				newSteps[2] = { ...newSteps[2], status: "pending" };
			} else if (resultsCount > 0 && isSummarizing) {
				newSteps[0] = { ...newSteps[0], status: "completed" };
				newSteps[1] = { ...newSteps[1], status: "completed" };
				newSteps[2] = { ...newSteps[2], status: "active" };
			} else if (resultsCount > 0 && !isSummarizing) {
				newSteps[0] = { ...newSteps[0], status: "completed" };
				newSteps[1] = { ...newSteps[1], status: "completed" };
				newSteps[2] = { ...newSteps[2], status: "completed" };
			}
			
			return newSteps;
		});
	}, [isSearching, resultsCount, isSummarizing]);

	const completedCount = steps.filter((s) => s.status === "completed").length;
	const progress = (completedCount / steps.length) * 100;

	return (
		<div className={cn("w-full overflow-hidden rounded-xl border bg-card p-4", className)}>
			{/* Header with query and progress */}
			<div className="mb-4 flex items-center gap-3">
				<div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
					{isSearching || isSummarizing ? (
						<>
							<motion.div
								className="absolute inset-0 rounded-lg bg-white/20"
								animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
								transition={{ duration: 1.5, repeat: Infinity }}
							/>
							<Search className="h-4 w-4 text-primary" />
						</>
					) : (
						<Check className="h-4 w-4 text-primary" />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2 font-medium text-sm">
						<span className="text-muted-foreground">Searching:</span>
						<span className="truncate text-foreground">{query}</span>
					</div>
					<div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
						<motion.div
							className="h-full rounded-full bg-primary"
							initial={{ width: 0 }}
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.5, ease: "easeOut" }}
						/>
					</div>
				</div>
			</div>

			{/* Steps */}
			<div className="space-y-2">
				{steps.map((step, index) => (
					<motion.div
						key={step.id}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 }}
						className={cn(
							"flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
							step.status === "active" && "bg-white/5",
							step.status === "completed" && "opacity-60"
						)}
					>
						<div
							className={cn(
								"flex h-6 w-6 items-center justify-center rounded-full transition-colors",
								step.status === "pending" && "bg-muted text-muted-foreground",
								step.status === "active" && "bg-white/15 text-foreground",
								step.status === "completed" && "bg-white/10 text-foreground"
							)}
						>
							<AnimatePresence mode="wait">
								{step.status === "active" ? (
									<motion.div
										key="pulsing"
										animate={{ opacity: [0.5, 1, 0.5] }}
										transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
									>
										{step.icon}
									</motion.div>
								) : step.status === "completed" ? (
									<motion.div
										key="check"
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.2 }}
									>
										<Check className="h-3.5 w-3.5" />
									</motion.div>
								) : (
									<motion.div key="icon">{step.icon}</motion.div>
								)}
							</AnimatePresence>
						</div>

						<span
							className={cn(
								"text-sm transition-colors",
								step.status === "active" && "font-medium text-foreground",
								step.status === "pending" && "text-muted-foreground",
								step.status === "completed" && "text-muted-foreground line-through"
							)}
						>
							{step.label}
						</span>

						{step.status === "completed" && index < steps.length - 1 && (
							<motion.div
								initial={{ opacity: 0, x: -5 }}
								animate={{ opacity: 1, x: 0 }}
								className="ml-auto"
							>
								<ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
							</motion.div>
						)}
					</motion.div>
				))}
			</div>

			{/* Results count indicator */}
			{resultsCount > 0 && !isSearching && (
				<motion.div
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-3 flex items-center gap-2 border-t pt-3 text-muted-foreground text-xs"
				>
					<Link2 className="h-3 w-3" />
					<span>Found {resultsCount} sources</span>
				</motion.div>
			)}
		</div>
	);
}

// Compact search badge for inline use
export function SearchBadge({
	query,
	isActive,
	className,
}: {
	query: string;
	isActive: boolean;
	className?: string;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			className={cn(
				"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
				isActive ? "border-white/20 bg-white/10" : "border-border bg-muted",
				className
			)}
		>
			{isActive ? (
				<motion.div
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
				>
					<Search className="h-3 w-3 text-primary" />
				</motion.div>
			) : (
				<Check className="h-3 w-3 text-primary" />
			)}
			<span className="max-w-[200px] truncate">{query}</span>
		</motion.div>
	);
}
