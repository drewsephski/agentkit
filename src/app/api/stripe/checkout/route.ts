import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createStripeCustomer, getStripeSession } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, mode, couponCode } = await req.json();

    if (!priceId || !mode) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get user info from Clerk for customer creation
    const clerk = require("@clerk/nextjs/server");
    const user = await clerk.currentUser();
    
    let customerId: string | undefined;
    
    // Create Stripe customer if user email exists
    if (user?.emailAddresses?.[0]?.emailAddress) {
      const customer = await createStripeCustomer({
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : undefined,
      });
      customerId = customer.id;
    }

    const session = await getStripeSession({
      priceId,
      customerId,
      mode,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      couponCode,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
