/* eslint-disable @next/next/no-img-element */
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

export interface TestimonialCardProps
	extends React.HTMLAttributes<HTMLDivElement> {
	name: string;
	role: string;
	img?: string;
	description: React.ReactNode;
	className?: string;
}

export const TestimonialCard = ({
	description,
	name,
	img,
	role,
	className,
	...props
}: TestimonialCardProps) => (
	<div
		className={cn(
			"flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-5 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-accent dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0px_2px_8px_-2px_rgba(0,0,0,0.1)] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.08]",
			className,
		)}
		{...props}
	>
		<div className="select-none font-normal text-foreground/90 text-sm leading-relaxed">
			{description}
		</div>

		<div className="flex w-full select-none items-center justify-start gap-3">
			<img
				src={img}
				alt={name}
				className="size-8 rounded-full ring-1 ring-border dark:ring-white/[0.1]"
			/>

			<div>
				<p className="font-medium text-foreground text-sm">{name}</p>
				<p className="font-normal text-muted-foreground text-xs">{role}</p>
			</div>
		</div>
	</div>
);

interface Testimonial {
	id: string;
	name: string;
	role: string;
	img: string;
	description: React.ReactNode;
}

export function SocialProofTestimonials({
	testimonials,
}: {
	testimonials: Testimonial[];
}) {
	return (
		<div className="h-full">
			<div className="px-10">
				<div className="relative max-h-[750px] overflow-hidden">
					<div className="gap-0 md:columns-2 xl:columns-3">
						{Array(Math.ceil(testimonials.length / 3))
							.fill(0)
							.map((_, i) => (
								<Marquee
									vertical
									key={i}
									className={cn({
										"[--duration:60s]": i === 1,
										"[--duration:30s]": i === 2,
										"[--duration:70s]": i === 3,
									})}
								>
									{testimonials.slice(i * 3, (i + 1) * 3).map((card, idx) => (
										<TestimonialCard {...card} key={idx} />
									))}
								</Marquee>
							))}
					</div>
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/6 w-full bg-gradient-to-t from-20% from-background md:h-1/5"></div>
					<div className="pointer-events-none absolute inset-x-0 top-0 h-1/6 w-full bg-gradient-to-b from-20% from-background md:h-1/5"></div>
				</div>
			</div>
		</div>
	);
}
