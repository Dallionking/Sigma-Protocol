/**
 * Sigma Protocol - Sandbox Providers Index
 * 
 * Exports all available sandbox providers
 */

import { E2BProvider } from './e2b.js';
import { DockerProvider, SIGMA_DOCKER_IMAGE, DEFAULT_DOCKERFILE } from './docker.js';
import { DaytonaProvider, DEFAULT_DAYTONA_URL } from './daytona.js';

export {
  // Provider classes
  E2BProvider,
  DockerProvider,
  DaytonaProvider,
  
  // Constants
  SIGMA_DOCKER_IMAGE,
  DEFAULT_DOCKERFILE,
  DEFAULT_DAYTONA_URL
};

// Provider metadata for UI/CLI
export const PROVIDERS = {
  e2b: {
    name: 'E2B Cloud',
    description: 'Scalable cloud sandboxes (~$0.10/min)',
    class: E2BProvider,
    requiresApiKey: true,
    envVar: 'E2B_API_KEY',
    setupUrl: 'https://e2b.dev',
    features: ['cloud', 'preview-urls', 'scalable', 'fast-startup'],
    costPerMinute: 0.10
  },
  docker: {
    name: 'Docker (Local)',
    description: 'Free local isolation using Docker containers',
    class: DockerProvider,
    requiresApiKey: false,
    features: ['free', 'local', 'offline-capable', 'full-control'],
    costPerMinute: 0
  },
  daytona: {
    name: 'Daytona',
    description: 'Open-source cloud environments (~$0.08/min)',
    class: DaytonaProvider,
    requiresApiKey: true,
    envVar: 'DAYTONA_API_KEY',
    setupUrl: 'https://www.daytona.io',
    features: ['cloud', 'self-hosted-option', 'ide-integration', 'git-integration'],
    costPerMinute: 0.08
  }
};
