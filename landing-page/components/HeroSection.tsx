'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Github, ArrowRight } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { trackInstallCommandCopied, trackCtaClicked, trackGitHubLinkClicked } from '@/lib/analytics/posthog';

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const command = 'brew install sigma';
    const success = await copyToClipboard(command);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackInstallCommandCopied(command);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gotham-purple/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gotham-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gotham-neon/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-24 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-6xl lg:text-7xl font-bold leading-tight"
              >
                Ship Production-Ready Features{' '}
                <span className="bg-gradient-to-r from-gotham-purple to-gotham-blue bg-clip-text text-transparent">
                  10x Faster
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl lg:text-2xl text-text-secondary max-w-2xl"
              >
                AI-powered PRD generation + swarm orchestration. 13-step workflow. 4 platforms.
              </motion.p>
            </div>

            {/* Install command */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <div className="bg-gotham-surface border border-gotham-purple/20 rounded-lg p-4 font-mono text-sm flex items-center justify-between group hover:border-gotham-purple/40 transition-colors">
                <code className="text-gotham-blue">$ brew install sigma</code>
                <button
                  onClick={handleCopy}
                  className="ml-4 p-2 rounded-md hover:bg-gotham-purple/10 transition-colors focus:outline-none focus:ring-2 focus:ring-gotham-neon"
                  aria-label="Copy install command"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-gotham-neon" />
                  ) : (
                    <Copy className="w-5 h-5 text-text-secondary" />
                  )}
                </button>
              </div>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-10 right-0 bg-gotham-neon text-gotham-bg px-3 py-1 rounded-md text-sm font-medium"
                >
                  Copied!
                </motion.div>
              )}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#quick-start"
                onClick={() => trackCtaClicked('Get Started', 'hero')}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gotham-purple to-gotham-blue text-white rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-gotham-blue"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a
                href="https://github.com/dallionking/sigma-protocol"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGitHubLinkClicked('hero')}
                className="inline-flex items-center justify-center px-8 py-4 bg-gotham-surface border border-gotham-purple/20 text-text-primary rounded-lg font-medium hover:border-gotham-purple/40 transition-colors focus:outline-none focus:ring-2 focus:ring-gotham-purple"
              >
                <Github className="mr-2 w-5 h-5" />
                View on GitHub
              </a>
            </motion.div>
          </motion.div>

          {/* Right: Terminal visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="hidden lg:block"
          >
            <div className="bg-gotham-surface border border-gotham-purple/20 rounded-lg overflow-hidden shadow-2xl shadow-gotham-purple/10">
              <div className="bg-gotham-bg/50 px-4 py-2 border-b border-gotham-purple/20 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-text-secondary text-sm">sigma-protocol</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="text-gotham-neon">$ sigma step-1-ideation "AI-powered todo app"</div>
                <div className="text-text-secondary">✓ Analyzing value proposition...</div>
                <div className="text-text-secondary">✓ Applying Hormozi Value Equation...</div>
                <div className="text-text-secondary">✓ Generating MASTER_PRD.md...</div>
                <div className="text-gotham-gold mt-4">✨ PRD generated successfully!</div>
                <div className="text-text-primary mt-2">
                  📝 Output: docs/MASTER_PRD.md
                  <br />
                  🎯 Next: sigma step-2-architecture
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
