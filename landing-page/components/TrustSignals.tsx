'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Shield } from 'lucide-react';
import { PLATFORM_LOGOS, STATS } from '@/lib/constants';
import { fetchGitHubStars } from '@/lib/utils';

function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!isInView) return;

    if (value.includes('+')) {
      // Animate numbers with + suffix
      const numericValue = parseInt(value.replace(/\D/g, ''));
      let current = 0;
      const increment = Math.ceil(numericValue / 50);
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(current.toLocaleString() + '+');
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-4xl font-bold text-transparent bg-gradient-to-r from-gotham-purple to-gotham-blue bg-clip-text">
      {displayValue}
    </div>
  );
}

export function TrustSignals() {
  const [stars, setStars] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    fetchGitHubStars().then(setStars);
  }, []);

  return (
    <section ref={ref} className="py-24 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-gotham-purple to-gotham-blue bg-clip-text text-transparent">
              Developers Worldwide
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Open-source, battle-tested, and production-ready.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Badges and platform logos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* GitHub stars badge */}
            <div className="flex items-center gap-4 bg-gotham-surface border border-gotham-purple/20 rounded-lg p-6 hover:border-gotham-purple/40 transition-colors">
              <div className="p-3 bg-gradient-to-br from-gotham-purple to-gotham-blue rounded-lg">
                <Star className="w-8 h-8 text-white" fill="white" />
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {stars !== null ? stars.toLocaleString() : '1,000+'} Stars
                </div>
                <div className="text-text-secondary">on GitHub</div>
              </div>
            </div>

            {/* Open-source badge */}
            <div className="flex items-center gap-4 bg-gotham-surface border border-gotham-purple/20 rounded-lg p-6 hover:border-gotham-purple/40 transition-colors">
              <div className="p-3 bg-gradient-to-br from-gotham-neon to-gotham-gold rounded-lg">
                <Shield className="w-8 h-8 text-gotham-bg" />
              </div>
              <div>
                <div className="text-3xl font-bold">Open Source</div>
                <div className="text-text-secondary">MIT License</div>
              </div>
            </div>

            {/* Platform logos */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gotham-gold">Supported Platforms</h3>
              <div className="grid grid-cols-2 gap-4">
                {PLATFORM_LOGOS.map((platform, index) => (
                  <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="bg-gotham-surface border border-gotham-purple/20 rounded-lg p-4 hover:border-gotham-purple/40 transition-all hover:scale-105 group"
                    title={platform.description}
                  >
                    <div className="text-3xl mb-2">{platform.icon}</div>
                    <div className="text-sm font-medium">{platform.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-gotham-surface border border-gotham-purple/20 rounded-lg p-6 hover:border-gotham-purple/40 transition-all hover:shadow-lg hover:shadow-gotham-purple/10"
              >
                <AnimatedCounter value={stat.value} />
                <div className="text-text-secondary mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
