"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { AnimatePresence, motion, useInView } from "motion/react";
import React, {
	forwardRef,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";

import { cn } from "@/lib/utils";

type AccordionItemProps = {
	children: React.ReactNode;
	className?: string;
} & Accordion.AccordionItemProps;

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Item
			className={cn(
				"mt-px overflow-hidden focus-within:relative focus-within:z-10",
				className,
			)}
			{...props}
			ref={forwardedRef}
		>
			{children}
		</Accordion.Item>
	),
);
AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = {
	children: React.ReactNode;
	className?: string;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Header className="flex">
			<Accordion.Trigger
				className={cn(
					"group flex h-[45px] flex-1 cursor-pointer items-center justify-between p-3 text-[15px] leading-none outline-none",
					className,
				)}
				{...props}
				ref={forwardedRef}
			>
				{children}
			</Accordion.Trigger>
		</Accordion.Header>
	),
);
AccordionTrigger.displayName = "AccordionTrigger";

type AccordionContentProps = {
	children: ReactNode;
	className?: string;
} & Accordion.AccordionContentProps;

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Content
			className={cn(
				"overflow-hidden font-medium text-[15px] data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down",
				className,
			)}
			{...props}
			ref={forwardedRef}
		>
			<div className="p-3">{children}</div>
		</Accordion.Content>
	),
);
AccordionContent.displayName = "AccordionContent";

type FeatureItem = {
	id: number;
	title: string;
	content: string;
	image?: string;
	video?: string;
};
type FeatureProps = {
	collapseDelay?: number;
	ltr?: boolean;
	linePosition?: "left" | "right" | "top" | "bottom";
	lineColor?: string;
	featureItems: FeatureItem[];
};

export const Feature = ({
	collapseDelay = 5000,
	ltr = false,
	linePosition = "left",
	lineColor = "bg-neutral-500 dark:bg-white",
	featureItems,
}: FeatureProps) => {
	const [currentIndex, setCurrentIndex] = useState<number>(-1);
	const [imageLoaded, setImageLoaded] = useState<boolean>(false);
	const [previousIndex, setPreviousIndex] = useState<number>(-1);

	const carouselRef = useRef<HTMLUListElement>(null);
	const ref = useRef(null);
	const isInView = useInView(ref, {
		once: true,
		amount: 0.5,
	});

	useEffect(() => {
		const timer = setTimeout(() => {
			if (isInView) {
				setCurrentIndex(0);
			} else {
				setCurrentIndex(-1);
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [isInView]);

	const scrollToIndex = (index: number) => {
		if (carouselRef.current) {
			const card = carouselRef.current.querySelectorAll(".card")[index];
			if (card) {
				const cardRect = card.getBoundingClientRect();
				const carouselRect = carouselRef.current.getBoundingClientRect();
				const offset =
					cardRect.left -
					carouselRect.left -
					(carouselRect.width - cardRect.width) / 2;

				carouselRef.current.scrollTo({
					left: carouselRef.current.scrollLeft + offset,
					behavior: "smooth",
				});
			}
		}
	};

	// interval for changing images
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex !== undefined ? (prevIndex + 1) % featureItems.length : 0,
			);
		}, collapseDelay);

		return () => clearInterval(timer);
	}, [collapseDelay, currentIndex, featureItems.length]);

	useEffect(() => {
		const handleAutoScroll = () => {
			const nextIndex =
				(currentIndex !== undefined ? currentIndex + 1 : 0) %
				featureItems.length;
			scrollToIndex(nextIndex);
		};

		const autoScrollTimer = setInterval(handleAutoScroll, collapseDelay);

		return () => clearInterval(autoScrollTimer);
	}, [collapseDelay, currentIndex, featureItems.length]);

	useEffect(() => {
		const carousel = carouselRef.current;
		if (carousel) {
			const handleScroll = () => {
				const scrollLeft = carousel.scrollLeft;
				const cardWidth = carousel.querySelector(".card")?.clientWidth || 0;
				const newIndex = Math.min(
					Math.floor(scrollLeft / cardWidth),
					featureItems.length - 1,
				);
				setCurrentIndex(newIndex);
			};

			carousel.addEventListener("scroll", handleScroll);
			return () => carousel.removeEventListener("scroll", handleScroll);
		}
	}, [featureItems.length]);

	// Handle image transition
	useEffect(() => {
		if (currentIndex !== previousIndex) {
			setImageLoaded(false);
			setPreviousIndex(currentIndex);
		}
	}, [currentIndex, previousIndex]);

	// Render media with smooth sliding transitions
	const renderMedia = () => {
		const currentItem = featureItems[currentIndex];

		if (!currentItem) {
			return (
				<div className="aspect-auto h-full w-full animate-pulse rounded-xl border border-white/[0.08] bg-black/20 p-2" />
			);
		}

		if (currentItem.image) {
			return (
				<div className="relative h-full w-full overflow-hidden">
					{/* Placeholder/Fallback - transparent */}
					<div
						className={cn(
							"absolute inset-0 rounded-xl border border-white/[0.08] bg-black/20",
							"transition-all duration-300 ease-out",
							imageLoaded ? "opacity-0" : "opacity-100",
						)}
					/>

					{/* Main Image with slide animation */}
					<AnimatePresence mode="wait">
						<motion.img
							key={currentIndex}
							src={currentItem.image}
							alt={currentItem.title}
							className={cn(
								"aspect-auto h-full w-full rounded-xl border border-white/[0.08] bg-black/20 object-contain p-2 shadow-2xl",
								imageLoaded ? "opacity-100" : "opacity-0",
							)}
							initial={{
								opacity: 0,
								x: 80,
								scale: 0.92,
								filter: "blur(4px)",
							}}
							animate={{
								opacity: imageLoaded ? 1 : 0,
								x: 0,
								scale: 1,
								filter: "blur(0px)",
							}}
							exit={{
								opacity: 0,
								x: -80,
								scale: 0.92,
								filter: "blur(4px)",
							}}
							transition={{
								duration: 0.5,
								ease: [0.25, 0.46, 0.45, 0.94],
							}}
							onLoad={() => setImageLoaded(true)}
							loading="eager"
							sizes="(max-width: 768px) 100vw, 50vw"
						/>
					</AnimatePresence>
				</div>
			);
		}

		if (currentItem.video) {
			return (
				<AnimatePresence mode="wait">
					<motion.video
						key={currentIndex}
						preload="auto"
						src={currentItem.video}
						className="aspect-auto h-full w-full rounded-xl border border-white/[0.08] bg-black/20 object-contain p-2 shadow-2xl"
						autoPlay
						loop
						muted
						playsInline
						initial={{ opacity: 0, x: 80, scale: 0.92, filter: "blur(4px)" }}
						animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
						exit={{ opacity: 0, x: -80, scale: 0.92, filter: "blur(4px)" }}
						transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
					/>
				</AnimatePresence>
			);
		}

		return (
			<div className="aspect-auto h-full w-full rounded-xl border border-white/[0.08] bg-black/20 p-2" />
		);
	};

	return (
		<div ref={ref} className="w-full">
			<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center">
				<div className="grid h-full w-full grid-cols-5 items-center gap-x-10 px-10 md:px-20">
					<div
						className={`col-span-2 hidden h-full w-full md:items-center lg:flex ${
							ltr ? "md:order-2 md:justify-end" : "justify-start"
						}`}
					>
						<Accordion.Root
							className="flex h-full w-full flex-col gap-8"
							type="single"
							defaultValue={`item-${currentIndex}`}
							value={`item-${currentIndex}`}
							onValueChange={(value) =>
								setCurrentIndex(Number(value.split("-")[1]))
							}
						>
							{featureItems.map((item, index) => (
								<AccordionItem
									key={item.id}
									className={cn(
										"group relative overflow-hidden rounded-xl border border-transparent bg-white/[0.02] transition-all duration-300",
										"hover:border-white/[0.06] hover:bg-white/[0.04]",
										"data-[state=open]:border-white/[0.12] data-[state=open]:bg-white/[0.06]",
									)}
									value={`item-${index}`}
								>
									<div
										className={cn(
											"absolute overflow-hidden rounded-lg transition-opacity",
											"data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
											"bg-neutral-300/50 dark:bg-neutral-300/30",
											{
												"top-0 bottom-0 left-0 h-full w-0.5":
													linePosition === "left",
												"top-0 right-0 bottom-0 h-full w-0.5":
													linePosition === "right",
												"top-0 right-0 left-0 h-0.5 w-full":
													linePosition === "top",
												"right-0 bottom-0 left-0 h-0.5 w-full":
													linePosition === "bottom",
											},
										)}
										data-state={currentIndex === index ? "open" : "closed"}
									>
										<div
											className={cn(
												"absolute transition-all ease-linear",
												lineColor,
												{
													"top-0 left-0 w-full": ["left", "right"].includes(
														linePosition,
													),
													"top-0 left-0 h-full": ["top", "bottom"].includes(
														linePosition,
													),
												},
												currentIndex === index
													? ["left", "right"].includes(linePosition)
														? "h-full"
														: "w-full"
													: ["left", "right"].includes(linePosition)
														? "h-0"
														: "w-0",
											)}
											style={{
												transitionDuration:
													currentIndex === index ? `${collapseDelay}ms` : "0s",
											}}
										/>
									</div>
									<AccordionTrigger className="text-left font-semibold text-lg tracking-tight">
										{item.title}
									</AccordionTrigger>
									<AccordionContent className="font-medium text-sm">
										{item.content}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion.Root>
					</div>
					<div
						className={`col-span-5 h-[350px] min-h-[200px] w-auto lg:col-span-3 ${
							ltr && "md:order-1"
						}`}
					>
						{renderMedia()}
					</div>

					<ul
						ref={carouselRef}
						className="col-span-5 flex snap-x snap-mandatory flex-nowrap overflow-x-auto [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_10%,white_90%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_10%,white_90%,transparent)] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
						style={{
							padding: "50px calc(50%)",
						}}
					>
						{featureItems.map((item, index) => (
							<a
								key={item.id}
								className="card group relative grid h-full max-w-64 shrink-0 items-start justify-center border-t border-b border-l border-white/[0.08] bg-black/[0.3] p-4 backdrop-blur-sm transition-all duration-300 hover:bg-black/[0.4] first:rounded-tl-xl last:rounded-tr-xl last:border-r"
								onClick={() => setCurrentIndex(index)}
								style={{
									scrollSnapAlign: "center",
								}}
							>
								<div
									className={cn(
										"absolute overflow-hidden rounded-lg transition-opacity",
										"data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
										"bg-neutral-300/50 dark:bg-neutral-300/30",
										{
											"top-0 bottom-0 left-0 h-full w-0.5":
												linePosition === "left",
											"top-0 right-0 bottom-0 h-full w-0.5":
												linePosition === "right",
											"top-0 right-0 left-0 h-0.5 w-full":
												linePosition === "top",
											"right-0 bottom-0 left-0 h-0.5 w-full":
												linePosition === "bottom",
										},
									)}
									data-state={currentIndex === index ? "open" : "closed"}
								>
									<div
										className={cn(
											"absolute transition-all ease-linear",
											lineColor,
											{
												"top-0 left-0 w-full": ["left", "right"].includes(
													linePosition,
												),
												"top-0 left-0 h-full": ["top", "bottom"].includes(
													linePosition,
												),
											},
											currentIndex === index
												? ["left", "right"].includes(linePosition)
													? "h-full"
													: "w-full"
												: ["left", "right"].includes(linePosition)
													? "h-0"
													: "w-0",
										)}
										style={{
											transitionDuration:
												currentIndex === index ? `${collapseDelay}ms` : "0s",
										}}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<h2 className="font-bold text-lg">{item.title}</h2>
									<p className="mx-0 max-w-sm text-balance font-medium text-sm leading-relaxed">
										{item.content}
									</p>
								</div>
							</a>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};
