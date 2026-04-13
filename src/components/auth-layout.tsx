import Link from "next/link";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/site";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="grid min-h-svh lg:grid-cols-[60%_1fr]">
			{/* Vertical Video Side */}
			<div className="relative hidden overflow-hidden bg-muted lg:flex lg:flex-col">
				<video
					autoPlay
					loop
					muted
					playsInline
					preload="auto"
					className="h-full w-full object-cover grayscale-[0.2] dark:opacity-40 dark:grayscale-0"
					src="/agentkit-hero-video.mp4"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/30 dark:from-background/30 dark:via-transparent dark:to-background/50" />
				{/* Brand overlay on video */}
				<div className="absolute right-8 bottom-8 left-8">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-background/90 backdrop-blur-sm dark:bg-background/80">
							<Icons.logo className="size-5" />
						</div>
						<div>
							<p className="font-semibold text-foreground/90 dark:text-foreground/80">
								{siteConfig.name}
							</p>
							<p className="text-foreground/60 text-sm dark:text-foreground/50">
								Build AI agents in minutes
							</p>
						</div>
					</div>
				</div>
			</div>
			{/* Form Side */}
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link href="/" className="flex items-center gap-2 font-medium">
						<div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Icons.logo className="size-4" />
						</div>
						{siteConfig.name}
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">{children}</div>
				</div>
			</div>
		</div>
	);
}
