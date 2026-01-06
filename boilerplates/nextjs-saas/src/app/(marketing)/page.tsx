"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles, Zap, Shield } from "lucide-react";
import { Particles } from "@/components/ui/particles";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";
import { BorderBeam } from "@/components/ui/border-beam";

/**
 * Landing Page
 *
 * Marketing homepage with hero, features, social proof, and CTA.
 * Enhanced with Magic UI components for premium visual experience.
 *
 * @module marketing
 */
export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20" />

        {/* Particles Background */}
        <Particles
          className="absolute inset-0"
          quantity={50}
          color="#8b5cf6"
          staticity={30}
          ease={80}
          size={0.5}
        />

        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <BlurFade delay={0.1} inView>
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-background shadow-sm">
                <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
                <span>Built with SSS Methodology</span>
              </div>
            </BlurFade>

            {/* Headline with Animation */}
            <BlurFade delay={0.2} inView>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <TextAnimate
                  animation="blurInUp"
                  by="word"
                  className="inline"
                  once
                >
                  Ship your SaaS
                </TextAnimate>{" "}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  <TextAnimate
                    animation="blurInUp"
                    by="word"
                    delay={0.3}
                    className="inline"
                    once
                  >
                    in days, not months
                  </TextAnimate>
                </span>
              </h1>
            </BlurFade>

            {/* Subheadline */}
            <BlurFade delay={0.4} inView>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
                Production-ready boilerplate with authentication, payments, AI
                integration, and everything you need to launch faster.
              </p>
            </BlurFade>

            {/* CTA Buttons */}
            <BlurFade delay={0.5} inView>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <ShimmerButton
                    className="text-lg px-8 py-3"
                    shimmerColor="#a855f7"
                    shimmerSize="0.08em"
                    background="linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </ShimmerButton>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </BlurFade>

            {/* Social Proof with BorderBeam */}
            <BlurFade delay={0.6} inView>
              <div className="relative rounded-full px-6 py-3 bg-background/80 backdrop-blur-sm border">
                <BorderBeam
                  size={60}
                  duration={8}
                  colorFrom="#8b5cf6"
                  colorTo="#3b82f6"
                  borderWidth={2}
                />
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-purple-400 to-blue-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">500+</span>{" "}
                    developers already shipping
                  </p>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 border-t">
        <div className="container px-4 md:px-6">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything you need to launch
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stop reinventing the wheel. Focus on what makes your product
                unique.
              </p>
            </div>
          </BlurFade>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <BlurFade key={idx} delay={0.1 + idx * 0.1} inView>
                <div className="group relative rounded-2xl border p-8 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-3">
                    <feature.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start free and scale as you grow. No hidden fees.
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <div className="flex justify-center">
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing Plans
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <BlurFade delay={0.1} inView>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 p-12 md:p-20">
              <div className="relative z-10 text-center text-white max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to ship faster?
                </h2>
                <p className="text-lg opacity-90 mb-8">
                  Join 500+ developers who are building and shipping with SSS
                  SaaS.
                </p>
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8"
                  >
                    Start Building Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>
    </>
  );
}

const features = [
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Supabase Auth with email, OAuth, magic links, and 2FA out of the box.",
  },
  {
    icon: Zap,
    title: "Payments",
    description:
      "Stripe integration with subscriptions, one-time payments, and usage-based billing.",
  },
  {
    icon: Sparkles,
    title: "AI Integration",
    description:
      "Vercel AI SDK with streaming, credits system, and multiple model support.",
  },
  {
    icon: Shield,
    title: "Database",
    description:
      "Supabase with row-level security, real-time subscriptions, and edge functions.",
  },
  {
    icon: Zap,
    title: "Analytics",
    description:
      "PostHog analytics with feature flags, session replay, and A/B testing.",
  },
  {
    icon: Sparkles,
    title: "Email",
    description:
      "Resend for transactional emails with beautiful React templates.",
  },
];
