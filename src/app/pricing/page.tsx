"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ChevronDown, Loader2, Sparkles, Zap, Video, Search, MessageSquare } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Navbar } from "@/components/sections/navbar";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

// Parse price string to number (e.g. "$49" -> 49, "$1,490" -> 1490)
const parsePrice = (priceStr: string): number => {
  return Number.parseInt(priceStr.replace(/[^0-9]/g, ""), 10) || 0;
};

// Unified SaaS pricing tiers - AI Video Generation + Web Research
// Stripe Price IDs:
// Starter: price_1TLMwLRZE8Whwvf0s8lq1FEM ($29/mo)
// Pro: price_1TLMwLRZE8Whwvf0hABEOHr1 ($79/mo)
const pricingTiers = [
  {
    name: "Free",
    description: "Perfect for exploring AgentKit",
    price: "$0",
    period: "/month",
    priceId: undefined,
    mode: "payment" as const,
    features: [
      "Web search enabled AI chat",
      "Streaming responses",
      "Persistent chat history",
      "Community support",
      "Preview video generation (1)",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Starter",
    description: "For creators getting started",
    price: "$29",
    period: "/month",
    priceId: "price_1TLMwLRZE8Whwvf0s8lq1FEM",
    mode: "subscription" as const,
    features: [
      "Everything in Free",
      "10 AI video generations/month",
      "HD video export",
      "Priority web search",
      "Email support",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Pro",
    description: "For professionals and teams",
    price: "$79",
    period: "/month",
    priceId: "price_1TLMwLRZE8Whwvf0hABEOHr1",
    mode: "subscription" as const,
    features: [
      "Everything in Starter",
      "Unlimited AI video generations",
      "Custom video templates",
      "Team seats (5 members)",
      "API access",
      "Priority support",
      "White-label options",
    ],
    cta: "Get Pro",
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Handle success/cancel messages
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  if (success && typeof window !== "undefined") {
    toast.success("Welcome to AgentKit! Your AI video generation credits are ready.");
    router.replace("/chat");
  }
  if (canceled && typeof window !== "undefined") {
    toast.info("Payment canceled. Your free tier is still available.");
    router.replace("/pricing");
  }

  // Calculate yearly price (2 months free = ~17% discount)
  const getYearlyPrice = (monthlyPrice: string) => {
    const price = parsePrice(monthlyPrice);
    return Math.round(price * 10); // 10 months for yearly
  };

  const handleCheckout = async (tier: typeof pricingTiers[0]) => {
    if (tier.name === "Free") {
      router.push("/sign-up");
      return;
    }

    if (!isSignedIn) {
      router.push("/sign-in?redirect=/pricing");
      return;
    }

    if (!tier.priceId) {
      toast.error("This plan is not yet available.");
      return;
    }

    setLoading(tier.name);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: tier.priceId,
          mode: tier.mode,
          couponCode: process.env.NEXT_PUBLIC_STRIPE_COUPON_EARLYBIRD,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to initiate checkout");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl border-x min-h-screen">
      <div className="absolute top-0 left-6 z-10 block h-full w-px border-border border-l"></div>
      <div className="absolute top-0 right-6 z-10 block h-full w-px border-border border-r"></div>
      <Navbar />
      <main className="flex min-h-screen w-full flex-col bg-gradient-to-b from-background to-muted/20 py-20 px-4">
        <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Limited Time: 20% Off with EARLYBIRD</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Video Generation + Web Research
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create stunning AI-powered videos and research the web with intelligent agents. 
            <br/>
            Start free, scale as you grow.
          </p>
        </div>

        {/* Value Props */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Video className="w-5 h-5 text-primary" />
            <span className="text-sm">AI Video Generation</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="w-5 h-5 text-primary" />
            <span className="text-sm">Web Research</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="text-sm">Streaming Chat</span>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="relative inline-flex bg-muted p-1.5 rounded-xl">
            <motion.div
              className="absolute inset-1.5 bg-background rounded-lg shadow-sm"
              layoutId="pricing-billing-tab"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
              style={{
                width: "calc(50% - 6px)",
                left: billingCycle === "monthly" ? "6px" : "calc(50%)",
              }}
            />
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative z-10 px-8 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                billingCycle === "monthly"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative z-10 px-8 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                billingCycle === "yearly"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={billingCycle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto"
          >
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {tier.priceId && (
                <div className="absolute -top-4 right-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                    className="relative"
                  >
                    <span className="relative z-10 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/30">
                      <Zap className="w-3 h-3 fill-current" />
                      Early Bird -20%
                    </span>
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-md"
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  {tier.priceId ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary dark:text-white">
                          $<NumberTicker
                            key={billingCycle + tier.name}
                            value={billingCycle === "yearly" ? getYearlyPrice(tier.price) : Math.round(parsePrice(tier.price) * 0.8)}
                            className="text-4xl font-bold text-primary"
                          />
                        </span>
                        <span className="text-muted-foreground">
                          /{billingCycle === "yearly" ? "year" : "month"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground line-through dark:text-white/60">
                          ${billingCycle === "yearly" ? parsePrice(tier.price) * 12 : parsePrice(tier.price)}
                        </span>
                        <span className="text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">with EARLYBIRD</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold dark:text-white">Free</span>
                      <span className="text-muted-foreground ml-2">forever</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={tier.popular ? "default" : "outline"}
                  onClick={() => handleCheckout(tier)}
                  disabled={loading === tier.name}
                >
                  {loading === tier.name ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    tier.cta
                  )}
                </Button>
              </CardFooter>
            </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            🎉 Limited time: Use code <span className="font-semibold text-primary">EARLYBIRD</span> for 20% off any paid plan
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="text-sm">Powered by Remotion</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm">Secure Stripe Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm">30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm">Instant Access</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection />
        </div>
      </main>
    </div>
  );
}

// FAQ Accordion Component
interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Why is video generation not included in the free plan?",
    answer: "AI video generation requires significant computational resources (GPU rendering, storage, bandwidth). To keep AgentKit sustainable, we offer web search and chat for free while charging for video generation. This lets us provide high-quality video output without cutting corners.",
  },
  {
    question: "What is AI video generation?",
    answer: "AgentKit uses Remotion to programmatically generate professional videos. Create product demos, explainers, social content, and more using code-driven video templates powered by AI. Videos are rendered in HD and ready to download.",
  },
  {
    question: "How does web research work?",
    answer: "Our AI agents can search the live web in real-time, gathering current information to answer your questions. Toggle web search on/off per conversation for accurate, up-to-date responses. Free users get standard search; paid plans get priority access.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes! You can switch plans anytime from your account settings. Your video generation credits and chat history will carry over. Upgrades are prorated, and you can downgrade at your next billing cycle.",
  },
  {
    question: "What happens when I hit my video generation limit?",
    answer: "Starter plan users can upgrade to Pro for unlimited videos, or wait until their credits reset next month. Pro users have unlimited generations. Need a custom enterprise plan? Contact us.",
  },
  {
    question: "Can I use the videos commercially?",
    answer: "Absolutely! All videos generated with AgentKit are yours to use commercially. Pro plans also include white-label options to remove AgentKit branding from your exported videos.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto mt-20 max-w-3xl">
      <h2 className="mb-8 text-center text-2xl font-bold">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={cn(
              "bg-card rounded-lg overflow-hidden border transition-colors duration-200",
              openIndex === index ? "border-border" : "border-transparent hover:border-border/50"
            )}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="font-semibold text-sm pr-4">{item.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
