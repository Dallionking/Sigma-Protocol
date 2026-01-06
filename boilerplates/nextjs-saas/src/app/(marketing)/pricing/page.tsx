"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";

interface PricingTabsProps {
  activeTab: "yearly" | "monthly";
  setActiveTab: (tab: "yearly" | "monthly") => void;
}

function PricingTabs({ activeTab, setActiveTab }: PricingTabsProps) {
  return (
    <div
      className={cn(
        "relative flex w-fit items-center rounded-full border p-0.5 backdrop-blur-sm cursor-pointer h-9 flex-row bg-muted",
      )}
    >
      {(["monthly", "yearly"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            "relative z-[1] px-4 h-8 flex items-center justify-center cursor-pointer",
            {
              "z-0": activeTab === tab,
            },
          )}
        >
          {activeTab === tab && (
            <motion.div
              layoutId="pricing-active-tab"
              className="absolute inset-0 rounded-full bg-white dark:bg-zinc-700 shadow-md border border-border"
              transition={{
                duration: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 25,
                velocity: 2,
              }}
            />
          )}
          <span
            className={cn(
              "relative block text-sm font-medium duration-200 shrink-0",
              activeTab === tab ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "yearly" && (
              <span className="ml-2 text-xs font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900/30 py-0.5 px-1.5 rounded-full">
                -20%
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const getPrice = (monthlyPrice: number) => {
    if (billingCycle === "yearly") {
      return Math.round(monthlyPrice * 12 * 0.8);
    }
    return monthlyPrice;
  };

  const PriceDisplay = ({ price }: { price: number }) => {
    const displayPrice = getPrice(price);

    return (
      <motion.span
        key={displayPrice}
        className="text-4xl font-bold"
        initial={{
          opacity: 0,
          x: billingCycle === "yearly" ? -10 : 10,
          filter: "blur(5px)",
        }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        ${displayPrice}
      </motion.span>
    );
  };

  return (
    <div className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. Start free and upgrade as
              you grow.
            </p>
            <div className="flex justify-center">
              <PricingTabs
                activeTab={billingCycle}
                setActiveTab={setBillingCycle}
              />
            </div>
          </div>
        </BlurFade>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <BlurFade key={plan.name} delay={0.2 + idx * 0.1} inView>
              <div
                className={cn(
                  "relative rounded-2xl border p-8 h-full flex flex-col",
                  plan.popular &&
                    "border-purple-500 shadow-lg shadow-purple-500/10",
                )}
              >
                {plan.popular && (
                  <>
                    <BorderBeam
                      size={80}
                      duration={6}
                      colorFrom="#8b5cf6"
                      colorTo="#3b82f6"
                      borderWidth={2}
                    />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-full">
                      Most Popular
                    </div>
                  </>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  {plan.price > 0 ? (
                    <>
                      <PriceDisplay price={plan.price} />
                      <span className="text-muted-foreground">
                        /{billingCycle === "yearly" ? "year" : "month"}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">$0</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>

                <Link href="/signup" className="block mb-8">
                  <Button
                    className={cn(
                      "w-full",
                      plan.popular &&
                        "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
                    )}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={0.5} inView>
          <div className="mt-20 text-center">
            <p className="text-muted-foreground">
              Need a custom plan?{" "}
              <Link href="/contact" className="text-purple-600 hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </BlurFade>
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
