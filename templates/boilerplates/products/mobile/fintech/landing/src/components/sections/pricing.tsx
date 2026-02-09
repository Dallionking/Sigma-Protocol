"use client";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { CheckIcon, ChevronRightIcon, Sparkles } from "lucide-react";
import { useRef } from "react";

export function Pricing() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacities = [
    useTransform(scrollYProgress, [0, 0.1, 0.3], [0, 0, 1]),
    useTransform(scrollYProgress, [0, 0.15, 0.35], [0, 0, 1]),
    useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 0, 1]),
  ];

  const yTransforms = [
    useTransform(scrollYProgress, [0, 0.1, 0.3], [100, 100, 0]),
    useTransform(scrollYProgress, [0, 0.15, 0.35], [100, 100, 0]),
    useTransform(scrollYProgress, [0, 0.2, 0.4], [100, 100, 0]),
  ];

  return (
    <Section
      id="pricing"
      title="Simple, Transparent Pricing"
      subtitle="Choose Your Trading Edge"
      className="container px-4 sm:px-10 mx-auto max-w-[var(--max-container-width)]"
      ref={ref}
    >
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto py-10">
        {siteConfig.pricing.map((plan, index) => (
          <motion.div
            key={plan.name}
            style={{ opacity: opacities[index], y: yTransforms[index] }}
            className={cn(
              "relative p-6 lg:p-8 rounded-3xl grid grid-rows-[auto_auto_1fr_auto] border",
              plan.isPopular
                ? "bg-primary/5 border-primary/50 neon-border"
                : "bg-muted/30 border-border"
            )}
          >
            {/* Popular badge */}
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </div>
              </div>
            )}

            {/* Plan name */}
            <h2
              className={cn(
                "text-2xl font-bold mb-4 font-display",
                plan.isPopular ? "text-primary" : "text-foreground"
              )}
            >
              {plan.name}
            </h2>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-5xl font-bold",
                    plan.isPopular ? "text-primary neon-text" : "text-foreground"
                  )}
                >
                  {plan.price}
                </span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {plan.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start gap-3">
                  <CheckIcon
                    className={cn(
                      "w-5 h-5 mt-0.5 flex-shrink-0",
                      plan.isPopular ? "text-primary" : "text-primary/70"
                    )}
                  />
                  <span className="text-sm text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              variant={plan.isPopular ? "default" : "outline"}
              size="lg"
              className={cn(
                "rounded-full font-semibold w-full",
                plan.isPopular
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 neon-glow"
                  : "border-primary/50 text-primary hover:bg-primary/10"
              )}
            >
              {plan.buttonText}
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Trust note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        All plans include 14-day money-back guarantee. Cancel anytime.
      </motion.p>
    </Section>
  );
}
