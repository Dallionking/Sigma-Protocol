'use client';

import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        },
      });
    }
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, string | number | boolean>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties);
  }
};

export const trackInstallCommandCopied = (command: string, variant?: string) => {
  const properties: Record<string, string | number | boolean> = { command };
  if (variant) properties.variant = variant;
  trackEvent('install_command_copied', properties);
};

export const trackCtaClicked = (ctaText: string, ctaLocation: string) => {
  trackEvent('cta_clicked', { cta_text: ctaText, cta_location: ctaLocation });
};

export const trackWorkflowStepExpanded = (stepId: number, stepName: string) => {
  trackEvent('workflow_step_expanded', { step_id: stepId, step_name: stepName });
};

export const trackGitHubLinkClicked = (location: string) => {
  trackEvent('github_link_clicked', { location });
};
