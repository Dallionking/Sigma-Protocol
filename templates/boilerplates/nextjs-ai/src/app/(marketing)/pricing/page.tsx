import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pricing Page
 * 
 * Pricing plans with features comparison.
 * 
 * @module marketing
 */
export default function PricingPage() {
  return (
    <div className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8",
                plan.popular && "border-purple-500 shadow-lg shadow-purple-500/10"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <Link href="/signup" className="block mb-8">
                <Button
                  className={cn(
                    "w-full",
                    plan.popular && "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ or Comparison */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground">
            Need a custom plan?{" "}
            <Link href="/contact" className="text-purple-600 hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const plans = [
  {
    name: "Free",
    description: "Perfect for side projects",
    price: 0,
    cta: "Get Started",
    popular: false,
    features: [
      "100 AI credits/month",
      "1 project",
      "Basic analytics",
      "Community support",
      "SSS commands included",
    ],
  },
  {
    name: "Pro",
    description: "For growing businesses",
    price: 29,
    cta: "Start Pro Trial",
    popular: true,
    features: [
      "Unlimited AI credits",
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Custom domains",
      "Team collaboration",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: 99,
    cta: "Contact Sales",
    popular: false,
    features: [
      "Everything in Pro",
      "SSO/SAML",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
      "Audit logs",
      "White-labeling",
    ],
  },
];

