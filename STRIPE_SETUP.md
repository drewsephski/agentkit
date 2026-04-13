# Stripe Setup Guide

This guide walks you through setting up Stripe billing for AgentKit.

## ✅ What's Already Set Up

The following Stripe products and prices have been created:

### White-Label Licenses (One-time)
- **Starter License**: $299 one-time
  - Price ID: `price_1TLDhhRZE8Whwvf09Xhfp4XU`
- **Pro License**: $799 one-time
  - Price ID: `price_1TLDhhRZE8Whwvf09FedJGFq`

### Managed Hosting (Monthly Subscriptions)
- **Starter Hosting**: $99/month
  - Price ID: `price_1TLDhlRZE8Whwvf0VFsnVnAk`
- **Growth Hosting**: $199/month
  - Price ID: `price_1TLDhmRZE8Whwvf0cQqjE0mL`
- **Enterprise Hosting**: $299/month
  - Price ID: `price_1TLDhmRZE8Whwvf0z3GQfAe7`

### Early Bird Coupon
- **20% Off Early Bird**: `52Ebmzpg`

## 🔧 Required Configuration

### 1. Add Stripe API Keys to `.env.local`

```env
# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

Get these from your [Stripe Dashboard](https://dashboard.stripe.com):
- Secret key: Developers → API Keys → Secret key
- Publishable key: Developers → API Keys → Publishable key

### 2. Run Database Migration

```bash
pnpm prisma migrate reset
```

This will add the `UserSubscription` table to track customer subscriptions.

### 3. Set Up Stripe Webhook

#### For Local Development (using Stripe CLI):

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret (starts with `whsec_`) to your `.env.local`.

#### For Production:

1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret to your environment variables

## 🚀 Quick Wins Implemented

### 1. Pricing Page
- URL: `/pricing`
- Features tabbed interface for Licenses vs Hosting
- 20% Early Bird discount badge
- FAQ section included

### 2. Checkout Flow
- Secure Stripe Checkout integration
- Automatic customer creation
- Support for coupon codes
- Success/cancel handling with toast notifications

### 3. Billing Portal
- Customers can manage their subscriptions
- Update payment methods
- View invoices
- Cancel/upgrade plans

### 4. Subscription Status Component
- Display current plan
- Show renewal/cancellation dates
- Quick access to billing portal

## 📝 Next Steps

1. **Test the flow**: Complete a test purchase using Stripe test cards
   - Test card: `4242 4242 4242 4242`
   - Any future expiry, any CVC, any ZIP

2. **Customize pricing**: Edit the pricing tiers in `/src/app/pricing/page.tsx`

3. **Add subscription gating**: Use the `SubscriptionStatus` component to restrict features:
   ```tsx
   import { SubscriptionStatus } from "@/components/subscription-status";
   
   // In your dashboard/page:
   <SubscriptionStatus 
     status={subscription?.status}
     currentPeriodEnd={subscription?.currentPeriodEnd}
     priceId={subscription?.priceId}
   />
   ```

4. **Add usage limits**: Track messages/usage and gate based on plan tier

5. **Go Live**: 
   - Switch to Stripe Live mode
   - Update environment variables with live keys
   - Test one more purchase
   - Launch! 🚀

## 💰 Revenue Model

| Tier | Price | Target Customer |
|------|-------|-----------------|
| Starter License | $299 | Solo developers, small agencies |
| Pro License | $799 | Agencies needing customization |
| Starter Hosting | $99/mo | Small teams, 10 members |
| Growth Hosting | $199/mo | Growing businesses, 50 members |
| Enterprise Hosting | $299/mo | Large orgs, unlimited members |

## 🔗 Important Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Billing Portal](https://stripe.com/docs/billing/subscriptions/integrating-self-serve-portal)

## 🆘 Support

If you encounter issues:
1. Check webhook events in Stripe Dashboard → Developers → Events
2. Verify environment variables are set correctly
3. Check server logs for webhook payload errors
4. Ensure database migration ran successfully
