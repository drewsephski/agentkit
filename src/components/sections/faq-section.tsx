import { SectionHeader } from "@/components/section-header";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/lib/config";

export function FAQSection() {
	const { faqSection } = siteConfig;

	return (
		<section
			id="faq"
			className="relative flex w-full flex-col items-center justify-center gap-10 pb-10"
		>
			<SectionHeader>
				<h2 className="text-balance text-center font-medium text-3xl tracking-tighter md:text-4xl">
					{faqSection.title}
				</h2>
				<p className="text-balance text-center font-medium text-muted-foreground">
					{faqSection.description}
				</p>
			</SectionHeader>

			<div className="mx-auto w-full max-w-3xl px-10">
				<Accordion
					type="single"
					collapsible
					className="grid w-full gap-2 border-b-0"
				>
					{faqSection.faQitems.map((faq, index) => (
						<AccordionItem
							key={index}
							value={index.toString()}
							className="grid gap-2 border-0"
						>
							<AccordionTrigger className="cursor-pointer rounded-xl border border-border bg-muted/50 px-5 py-4 font-medium text-foreground text-sm no-underline backdrop-blur-sm transition-all duration-200 hover:bg-accent hover:no-underline data-[state=open]:border-primary/30 data-[state=open]:bg-primary/5 dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className="rounded-xl border border-border bg-accent/50 p-4 text-foreground backdrop-blur-sm dark:border-white/[0.06] dark:bg-black/[0.2]">
								<p className="font-medium text-muted-foreground text-sm leading-relaxed">
									{faq.answer}
								</p>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
