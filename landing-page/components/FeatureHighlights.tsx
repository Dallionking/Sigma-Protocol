'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, Workflow, Layers } from 'lucide-react';

const features = [
  {
    icon: Users,
    gradient: 'from-gotham-purple to-gotham-blue',
    title: 'AI Swarm Orchestration',
    description:
      'Coordinate 5-20 specialized agents in parallel. Devil&apos;s Advocate + Gap Analyst mandatory quality gates ensure bulletproof output.',
    link: 'https://github.com/dallionking/sigma-protocol#swarm-orchestration',
  },
  {
    icon: Workflow,
    gradient: 'from-gotham-blue to-gotham-neon',
    title: '13-Step Workflow',
    description:
      'From ideation to skillpack generation. Bulletproof gates ensure nothing falls through cracks. Value Equation driven.',
    link: 'https://github.com/dallionking/sigma-protocol#workflow',
  },
  {
    icon: Layers,
    gradient: 'from-gotham-neon to-gotham-gold',
    title: 'Multi-Platform Support',
    description:
      'Claude Code, Cursor, Codex, OpenCode. Same workflow, any tool. 189 skills work across all platforms.',
    link: 'https://github.com/dallionking/sigma-protocol#platforms',
  },
];

export function FeatureHighlights() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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
            What Makes Sigma{' '}
            <span className="bg-gradient-to-r from-gotham-purple to-gotham-blue bg-clip-text text-transparent">
              Unstoppable
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Not just another AI tool. A complete methodology for shipping production-ready features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-gotham-surface border border-gotham-purple/20 rounded-lg p-8 hover:border-gotham-purple/40 transition-all duration-300 hover:shadow-xl hover:shadow-gotham-purple/10 hover:scale-105">
                {/* Icon */}
                <div className={`w-24 h-24 mb-6 rounded-lg bg-gradient-to-br ${feature.gradient} p-0.5`}>
                  <div className="w-full h-full bg-gotham-bg rounded-lg flex items-center justify-center">
                    <feature.icon className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary mb-4">{feature.description}</p>

                {/* Learn more link */}
                <a
                  href={feature.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-gotham-purple hover:text-gotham-blue transition-colors font-medium"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
