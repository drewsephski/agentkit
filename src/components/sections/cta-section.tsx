import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function CTASection() {
	const { ctaSection } = siteConfig;

	return (
		<section
			id="cta"
			className="flex w-full flex-col items-center justify-center"
		>
			<div className="w-full px-4">
				<div className="relative z-20 h-[400px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-2xl backdrop-blur-sm md:h-[400px]">
					<Image
						src={ctaSection.backgroundImage}
						alt="Agent CTA Background"
						className="absolute inset-0 h-full w-full object-cover object-right md:object-center"
						fill
						priority
					/>
					<div className="absolute inset-0 -top-32 flex flex-col items-center justify-center md:-top-40">
						<h1 className="max-w-xs text-center font-medium text-4xl text-foreground tracking-tighter md:max-w-xl md:text-7xl">
							{ctaSection.title}
						</h1>
						<div className="absolute bottom-10 flex flex-col items-center justify-center gap-2">
							<Link
								href={ctaSection.button.href}
								className="flex h-10 w-fit items-center justify-center rounded-full bg-primary px-4 font-semibold text-primary-foreground text-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] transition-all duration-200 hover:bg-primary/90 hover:shadow-lg"
							>
								{ctaSection.button.text}
							</Link>
							<span className="font-medium text-muted-foreground text-sm">
								{ctaSection.subtext}
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
