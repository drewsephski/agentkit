/* eslint-disable @next/next/no-img-element */
import { siteConfig } from "@/lib/config";

export function QuoteSection() {
	const { quoteSection } = siteConfig;

	return (
		<section
			id="quote"
			className="z-20 flex w-full flex-col items-center justify-center gap-8 border-y border-border bg-muted/30 p-14 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.02]"
		>
			<blockquote className="max-w-3xl px-4 text-left">
				<p className="mb-6 font-medium text-foreground text-xl leading-relaxed tracking-tighter md:text-2xl">
					{quoteSection.quote}
				</p>

				<div className="flex gap-4">
					<div className="size-10 rounded-full border border-border bg-accent ring-2 ring-primary/20 dark:border-white/[0.08] dark:bg-white/[0.05]">
						<img
							src={quoteSection.author.image}
							alt={quoteSection.author.name}
							className="size-full rounded-full object-contain"
						/>
					</div>
					<div className="text-left">
						<cite className="font-medium text-foreground text-lg not-italic">
							{quoteSection.author.name}
						</cite>
						<p className="font-medium text-muted-foreground text-sm">
							{quoteSection.author.role}
						</p>
					</div>
				</div>
			</blockquote>
		</section>
	);
}
