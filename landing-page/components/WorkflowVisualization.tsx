'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { WORKFLOW_STEPS } from '@/lib/constants';
import { trackWorkflowStepExpanded } from '@/lib/analytics/posthog';

export function WorkflowVisualization() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleStepExpand = (stepId: number) => {
    const newExpandedStep = expandedStep === stepId ? null : stepId;
    setExpandedStep(newExpandedStep);
    if (newExpandedStep !== null) {
      const step = WORKFLOW_STEPS.find(s => s.id === stepId);
      if (step) {
        trackWorkflowStepExpanded(stepId, step.name);
      }
    }
  };

  return (
    <section ref={ref} className="py-24 bg-gotham-surface/30">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            The{' '}
            <span className="bg-gradient-to-r from-gotham-purple to-gotham-blue bg-clip-text text-transparent">
              13-Step Workflow
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            From idea to production-ready PRDs. Every step has bulletproof quality gates.
          </p>
        </motion.div>

        {/* Desktop: Horizontal scroll timeline */}
        <div className="hidden lg:block mb-8">
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gotham-purple scrollbar-track-gotham-surface">
            {WORKFLOW_STEPS.map((step, index) => (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleStepExpand(step.id)}
                className={`snap-center flex-shrink-0 w-64 p-6 rounded-lg border transition-all duration-300 text-left ${
                  expandedStep === step.id
                    ? 'bg-gotham-purple/10 border-gotham-purple shadow-lg shadow-gotham-purple/20'
                    : 'bg-gotham-surface border-gotham-purple/20 hover:border-gotham-purple/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="text-4xl mb-3">{step.icon}</div>
                <div className="text-sm text-gotham-blue font-mono mb-1">Step {step.id}</div>
                <h3 className="text-lg font-bold mb-2">{step.name}</h3>
                <p className="text-sm text-text-secondary">{step.short}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Mobile: Accordion */}
        <div className="lg:hidden space-y-4">
          {WORKFLOW_STEPS.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <button
                onClick={() => handleStepExpand(step.id)}
                className="w-full bg-gotham-surface border border-gotham-purple/20 rounded-lg p-4 text-left hover:border-gotham-purple/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{step.icon}</span>
                    <div>
                      <div className="text-xs text-gotham-blue font-mono">Step {step.id}</div>
                      <h3 className="text-lg font-bold">{step.name}</h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-text-secondary transition-transform ${
                      expandedStep === step.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {expandedStep === step.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 bg-gotham-surface border border-gotham-purple/20 rounded-lg p-4"
                >
                  <p className="text-text-secondary mb-4">{step.long}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gotham-gold font-semibold">Output: </span>
                      <code className="text-gotham-blue">{step.artifact}</code>
                    </div>
                    <div>
                      <span className="text-gotham-gold font-semibold">Command: </span>
                      <code className="text-gotham-neon">{step.command}</code>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Expanded detail view for desktop */}
        {expandedStep !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block mt-8 bg-gotham-surface border border-gotham-purple/40 rounded-lg p-8"
          >
            {WORKFLOW_STEPS.find((s) => s.id === expandedStep) && (
              <>
                <div className="flex items-start gap-6 mb-6">
                  <div className="text-6xl">{WORKFLOW_STEPS.find((s) => s.id === expandedStep)!.icon}</div>
                  <div>
                    <div className="text-sm text-gotham-blue font-mono mb-2">
                      Step {expandedStep}
                    </div>
                    <h3 className="text-3xl font-bold mb-3">
                      {WORKFLOW_STEPS.find((s) => s.id === expandedStep)!.name}
                    </h3>
                    <p className="text-lg text-text-secondary">
                      {WORKFLOW_STEPS.find((s) => s.id === expandedStep)!.long}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gotham-bg/50 rounded-lg p-4">
                    <div className="text-gotham-gold font-semibold mb-2">Output Artifact</div>
                    <code className="text-gotham-blue">
                      {WORKFLOW_STEPS.find((s) => s.id === expandedStep)!.artifact}
                    </code>
                  </div>
                  <div className="bg-gotham-bg/50 rounded-lg p-4">
                    <div className="text-gotham-gold font-semibold mb-2">CLI Command</div>
                    <code className="text-gotham-neon">
                      {WORKFLOW_STEPS.find((s) => s.id === expandedStep)!.command}
                    </code>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
