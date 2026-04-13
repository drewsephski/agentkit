import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user's Stripe customer ID from database
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        status: {
          in: ["active", "canceled", "past_due"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
