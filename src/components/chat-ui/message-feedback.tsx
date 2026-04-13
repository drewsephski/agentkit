"use client";

import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, ThumbsDown, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MessageFeedbackProps {
	messageId: string;
	onFeedback?: (type: "up" | "down", messageId: string) => void;
	onRegenerate?: (messageId: string) => void;
	className?: string;
	showRegenerate?: boolean;
}

export function MessageFeedback({
	messageId,
	onFeedback,
	onRegenerate,
	className,
	showRegenerate = true,
}: MessageFeedbackProps) {
	const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleFeedback = async (type: "up" | "down") => {
		if (feedback === type) {
			setFeedback(null);
			return;
		}
		
		setIsSubmitting(true);
		await new Promise((resolve) => setTimeout(resolve, 200));
		setFeedback(type);
		setIsSubmitting(false);
		onFeedback?.(type, messageId);
	};

	const handleRegenerate = async () => {
		setIsSubmitting(true);
		await new Promise((resolve) => setTimeout(resolve, 200));
		setIsSubmitting(false);
		onRegenerate?.(messageId);
	};

	return (
		<div className={cn("flex items-center gap-0.5", className)}>
			{/* Thumbs up - professional subtle styling */}
			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={() => handleFeedback("up")}
				disabled={isSubmitting}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200",
					feedback === "up"
						? "bg-white/10 text-foreground"
						: "text-muted-foreground/70 hover:bg-muted hover:text-foreground"
				)}
			>
				<AnimatePresence mode="wait">
					{feedback === "up" ? (
						<motion.div
							key="check"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.15 }}
						>
							<Check className="h-3.5 w-3.5" />
						</motion.div>
					) : (
						<motion.div
							key="thumb"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						>
							<ThumbsUp className="h-3.5 w-3.5" />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.button>

			{/* Thumbs down - professional subtle styling */}
			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={() => handleFeedback("down")}
				disabled={isSubmitting}
				className={cn(
					"flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200",
					feedback === "down"
						? "bg-destructive/10 text-destructive"
						: "text-muted-foreground/70 hover:bg-muted hover:text-foreground"
					)}
			>
				<AnimatePresence mode="wait">
					{feedback === "down" ? (
						<motion.div
							key="check"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.15 }}
						>
							<Check className="h-3.5 w-3.5" />
						</motion.div>
					) : (
						<motion.div
							key="thumb"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						>
							<ThumbsDown className="h-3.5 w-3.5" />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.button>

			{/* Subtle divider */}
			<div className="mx-1 h-3.5 w-px bg-border/60" />

			{/* Regenerate - no rotation, professional */}
			{showRegenerate && (
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={handleRegenerate}
					disabled={isSubmitting}
					className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/70 transition-colors duration-200 hover:bg-muted hover:text-foreground"
				>
					<RotateCcw className="h-3.5 w-3.5" />
				</motion.button>
			)}
		</div>
	);
}

// Inline feedback form for when user gives negative feedback
export function FeedbackForm({
	isOpen,
	onCloseAction,
	onSubmitAction,
}: {
	isOpen: boolean;
	onCloseAction: () => void;
	onSubmitAction?: (feedback: string) => void;
}) {
	const [feedback, setFeedback] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!feedback.trim()) return;
		
		setIsSubmitting(true);
		await new Promise((resolve) => setTimeout(resolve, 400));
		onSubmitAction?.(feedback);
		setIsSubmitting(false);
		setFeedback("");
		onCloseAction();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.2 }}
					className="overflow-hidden"
				>
					<form onSubmit={handleSubmit} className="mt-3 space-y-2">
						<textarea
							value={feedback}
							onChange={(e) => setFeedback(e.target.value)}
							placeholder="What could be improved?"
							className="w-full rounded-lg border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/30"
							rows={2}
						/>
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={onCloseAction}
								className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isSubmitting || !feedback.trim()}
								className="rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
							>
								Submit
							</button>
						</div>
					</form>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
