"use client";

import { AppLogo } from "@/components/icons";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { easeInOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const { scrollY } = useScroll({
    offset: ["start start", "end start"],
  });
  const y1 = useTransform(scrollY, [0, 300], [100, 0]);
  const y2 = useTransform(scrollY, [0, 300], [50, 0]);
  const y3 = useTransform(scrollY, [0, 300], [0, 0]);
  const y4 = useTransform(scrollY, [0, 300], [50, 0]);
  const y5 = useTransform(scrollY, [0, 300], [100, 0]);

  return (
    <Section id="hero" className="min-h-[100vh] w-full overflow-hidden relative">
      {/* Background grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-50" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      
      <main className="mx-auto pt-16 sm:pt-24 md:pt-32 text-center relative px-4 z-10">
        <div className="relative">
          <motion.div
            initial={{ scale: 4.5, height: "80vh" }}
            animate={{ scale: 1, height: "10vh" }}
            transition={{
              scale: { delay: 0, duration: 1.8, ease: easeInOutCubic },
              height: { delay: 0, duration: 1.8, ease: easeInOutCubic },
            }}
            className="mb-16 relative z-20"
            style={{ transformOrigin: "top" }}
          >
            <div className="h-20 w-20 flex items-center justify-center mx-auto drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              <AppLogo size={80} />
            </div>
          </motion.div>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="absolute inset-0 top-20 z-10 font-display text-primary neon-text"
          >
            {siteConfig.name}
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Private Beta — Limited Spots Available</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: easeInOutCubic }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight font-display"
          >
            <span className="text-primary neon-text">{siteConfig.description}</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: easeInOutCubic }}
            className="text-2xl sm:text-3xl font-semibold mb-4 text-foreground/90"
          >
            {siteConfig.tagline}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: easeInOutCubic }}
            className="max-w-2xl mx-auto text-lg mb-10 text-muted-foreground text-balance"
          >
            Trading Platform&apos;s neural networks analyze markets in real-time, generating 
            high-probability trade signals and executing with precision—so you can 
            trade smarter without trading harder.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <Link href="#waitlist">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 neon-glow group"
              >
                {siteConfig.cta}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-lg font-semibold border-primary/50 text-primary hover:bg-primary/10"
              >
                See How It Works
              </Button>
            </Link>
          </motion.div>
        </div>
        
        {/* Device mockups with feature labels */}
        <div className="flex flex-nowrap items-start justify-center gap-4 sm:gap-8 select-none">
          <motion.div
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ y: y1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col items-center flex-shrink-0"
          >
            <img
              src="/Device-1.png.svg"
              alt="AI Signals Dashboard"
              className="w-40 sm:w-64 h-[333px] sm:h-[500px] drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            />
            <div className="mt-4 text-center">
              <p className="text-primary font-semibold text-sm sm:text-base">AI Signals</p>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-[160px]">Real-time trade alerts</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ y: y2 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col items-center flex-shrink-0"
          >
            <img
              src="/Device-2.png.svg"
              alt="Market Scanner"
              className="w-40 sm:w-64 h-[333px] sm:h-[500px] drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            />
            <div className="mt-4 text-center">
              <p className="text-primary font-semibold text-sm sm:text-base">Market Scanner</p>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-[160px]">Scan 1000+ assets instantly</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ y: y3 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col items-center flex-shrink-0"
          >
            <img
              src="/Device-3.png.svg"
              alt="Auto Trading"
              className="w-40 sm:w-64 h-[333px] sm:h-[500px] drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            />
            <div className="mt-4 text-center">
              <p className="text-primary font-semibold text-sm sm:text-base">Auto Trading</p>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-[160px]">Execute trades 24/7</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ y: y4 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col items-center flex-shrink-0"
          >
            <img
              src="/Device-4.png.svg"
              alt="Portfolio Tracking"
              className="w-40 sm:w-64 h-[333px] sm:h-[500px] drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            />
            <div className="mt-4 text-center">
              <p className="text-primary font-semibold text-sm sm:text-base">Portfolio</p>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-[160px]">Track all positions</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ y: y5 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col items-center flex-shrink-0"
          >
            <img
              src="/Device-5.png.svg"
              alt="Performance Analytics"
              className="w-40 sm:w-64 h-[333px] sm:h-[500px] drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            />
            <div className="mt-4 text-center">
              <p className="text-primary font-semibold text-sm sm:text-base">Analytics</p>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-[160px]">Deep performance insights</p>
            </div>
          </motion.div>
        </div>
      </main>
    </Section>
  );
}
