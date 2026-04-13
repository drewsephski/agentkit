import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

// Type assertion to handle Stripe SDK version differences
type StripeInvoice = Stripe.Invoice & { subscription?: string };
type StripeSubscription = Stripe.Subscription & { current_period_end: number };

export const getStripeSession = async ({
  priceId,
  customerId,
  mode,
  successUrl,
  cancelUrl,
  couponCode,
}: {
  priceId: string;
  customerId?: string;
  mode: "payment" | "subscription";
  successUrl: string;
  cancelUrl: string;
  couponCode?: string;
}) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...(couponCode && { discounts: [{ coupon: couponCode }] }),
    metadata: {
      priceId,
    },
  });

  return session;
};

export const createStripeCustomer = async ({
  email,
  name,
}: {
  email: string;
  name?: string;
}) => {
  const customer = await stripe.customers.create({
    email,
    name,
  });
  return customer;
};

export const getCustomerSubscriptions = async (customerId: string) => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    expand: ["data.default_payment_method"],
  });
  return subscriptions;
};
