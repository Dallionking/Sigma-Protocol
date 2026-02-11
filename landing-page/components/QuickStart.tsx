'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { QUICK_START_STEPS } from '@/lib/constants';
import { copyToClipboard } from '@/lib/utils';

export function QuickStart() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleCopy = async (command: string, index: number) => {
    const success = await copyToClipboard(command);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <section id="quick-start" ref={ref} className="py-24 bg-gotham-surface/30">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Get Started in{' '}
            <span className="bg-gradient-to-r from-gotham-purple to-gotham-blue bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            From zero to your first PRD in less than 5 minutes. No configuration required.
          </p>
        </motion.div>

        <div className="space-y-8">
          {QUICK_START_STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="bg-gotham-surface border border-gotham-purple/20 rounded-lg p-6 hover:border-gotham-purple/40 transition-colors"
            >
              <div className="flex items-start gap-6">
                {/* Step number */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gotham-purple to-gotham-blue rounded-lg flex items-center justify-center text-2xl font-bold">
                  {step.step}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-text-secondary mb-1">{step.description}</p>
                    <div className="text-sm text-gotham-gold">
                      ⏱ Estimated time: {step.estimatedTime}
                    </div>
                  </div>

                  {/* Command */}
                  <div className="relative">
                    <div className="bg-gotham-bg border border-gotham-purple/20 rounded-lg p-4 font-mono text-sm flex items-center justify-between group">
                      <code className="text-gotham-blue">{step.command}</code>
                      <button
                        onClick={() => handleCopy(step.command, index)}
                        className="ml-4 p-2 rounded-md hover:bg-gotham-purple/10 transition-colors focus:outline-none focus:ring-2 focus:ring-gotham-neon"
                        aria-label={`Copy command for step ${step.step}`}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-5 h-5 text-gotham-neon" />
                        ) : (
                          <Copy className="w-5 h-5 text-text-secondary" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Documentation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <a
            href="https://github.com/dallionking/sigma-protocol#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gotham-surface border border-gotham-purple/20 text-text-primary rounded-lg font-medium hover:border-gotham-purple/40 transition-colors focus:outline-none focus:ring-2 focus:ring-gotham-purple"
          >
            Read Full Documentation
            <ExternalLink className="ml-2 w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
