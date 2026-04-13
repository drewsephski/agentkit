import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update user subscription status in database
        if (session.customer && session.subscription) {
          await prisma.userSubscription.upsert({
            where: { stripeCustomerId: session.customer as string },
            create: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: "active",
              priceId: session.metadata?.priceId || "",
            },
            update: {
              stripeSubscriptionId: session.subscription as string,
              status: "active",
              priceId: session.metadata?.priceId || "",
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string; period_end?: number };
        if (invoice.subscription && invoice.customer && invoice.period_end) {
          await prisma.userSubscription.updateMany({
            where: { 
              stripeCustomerId: invoice.customer as string,
              stripeSubscriptionId: invoice.subscription,
            },
            data: { 
              status: "active",
              currentPeriodEnd: new Date(invoice.period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.userSubscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "canceled" },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription & { current_period_end: number };
        await prisma.userSubscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
