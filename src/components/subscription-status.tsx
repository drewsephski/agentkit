"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionStatusProps {
  status?: string;
  currentPeriodEnd?: Date;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
}

// Stripe Price IDs for AgentKit
// Starter: price_1TLMwLRZE8Whwvf0s8lq1FEM ($29/mo)
// Pro: price_1TLMwLRZE8Whwvf0hABEOHr1 ($79/mo)
const priceMap: Record<string, { name: string; type: string }> = {
  "price_1TLMwLRZE8Whwvf0s8lq1FEM": {
    name: "Starter",
    type: "Monthly Subscription",
  },
  "price_1TLMwLRZE8Whwvf0hABEOHr1": {
    name: "Pro",
    type: "Monthly Subscription",
  },
};

export function SubscriptionStatus({
  status,
  currentPeriodEnd,
  priceId,
  cancelAtPeriodEnd,
}: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const plan = priceId ? priceMap[priceId] : null;

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>You don&apos;t have an active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild className="w-full">
            <a href="/pricing">
              <CreditCard className="w-4 h-4 mr-2" />
              View Pricing Plans
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      canceled: "secondary",
      past_due: "destructive",
      incomplete: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your plan and billing</CardDescription>
          </div>
          {getStatusBadge(status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {plan && (
          <div className="space-y-1">
            <p className="font-medium">{plan.name}</p>
            <p className="text-sm text-muted-foreground">{plan.type}</p>
          </div>
        )}

        {currentPeriodEnd && status !== "canceled" && (
          <div className="text-sm">
            {cancelAtPeriodEnd ? (
              <span className="text-muted-foreground">
                Cancels on{" "}
                {new Date(currentPeriodEnd).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Renews on{" "}
                {new Date(currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleManageBilling}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Billing
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
