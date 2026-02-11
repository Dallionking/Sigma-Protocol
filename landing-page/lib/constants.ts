export interface WorkflowStep {
  id: number;
  name: string;
  icon: string;
  short: string;
  long: string;
  artifact: string;
  command: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    name: 'Ideation',
    icon: '💡',
    short: 'Hormozi Value Equation analysis',
    long: 'Apply $100M Offers framework to maximize perceived value. Analyze Dream Outcome, Perceived Likelihood, Time Delay, and Effort & Sacrifice to create a compelling product vision.',
    artifact: 'MASTER_PRD.md',
    command: 'sigma step-1-ideation "Your product idea"'
  },
  {
    id: 2,
    name: 'Architecture',
    icon: '🏗️',
    short: 'System architecture design',
    long: 'Design scalable system architecture with clear component boundaries, data flow, and integration patterns. Define tech stack and deployment strategy.',
    artifact: 'ARCHITECTURE.md',
    command: 'sigma step-2-architecture'
  },
  {
    id: 3,
    name: 'UX Design',
    icon: '🎨',
    short: 'User experience and flows',
    long: 'Create user flows, information architecture, and interaction patterns. Map user journeys and identify key touchpoints for optimal experience.',
    artifact: 'UX-DESIGN.md',
    command: 'sigma step-3-ux-design'
  },
  {
    id: 4,
    name: 'Flow Tree',
    icon: '🌳',
    short: 'Navigation flow and screen inventory',
    long: 'Build comprehensive navigation tree with bulletproof gates. Ensure every user path has proper error handling and success states.',
    artifact: 'FLOW-TREE.md',
    command: 'sigma step-4-flow-tree'
  },
  {
    id: 5,
    name: 'Wireframe Prototypes',
    icon: '📐',
    short: 'Low-fidelity screen designs',
    long: 'Create wireframes for all screens with annotations. Define component hierarchy, spacing, and responsive breakpoints.',
    artifact: 'docs/prds/flows/*.md',
    command: 'sigma step-5-wireframe-prototypes'
  },
  {
    id: 6,
    name: 'Design System',
    icon: '🎯',
    short: 'Design tokens and component library',
    long: 'Establish color palette, typography scale, spacing system, and reusable component patterns. Create style guide for consistent UI.',
    artifact: 'DESIGN-SYSTEM.md',
    command: 'sigma step-6-design-system'
  },
  {
    id: 7,
    name: 'Interface States',
    icon: '🔄',
    short: 'Loading, error, and empty states',
    long: 'Define all UI states: loading, error, empty, success. Ensure graceful degradation and clear user feedback at every interaction point.',
    artifact: 'STATE-SPEC.md',
    command: 'sigma step-7-interface-states'
  },
  {
    id: 8,
    name: 'Technical Spec',
    icon: '⚙️',
    short: 'API contracts and data models',
    long: 'Define API endpoints, request/response schemas, database models, and integration points. Document security requirements and performance targets.',
    artifact: 'TECHNICAL-SPEC.md',
    command: 'sigma step-8-technical-spec'
  },
  {
    id: 9,
    name: 'Landing Page',
    icon: '🚀',
    short: 'Marketing site design',
    long: 'Create conversion-focused landing page with clear value proposition, social proof, and compelling CTAs. Optimize for SEO and performance.',
    artifact: 'LANDING-PAGE.md',
    command: 'sigma step-9-landing-page'
  },
  {
    id: 10,
    name: 'Feature Breakdown',
    icon: '📊',
    short: 'Granular task decomposition',
    long: 'Break down features into atomic tasks with dependencies, acceptance criteria, and effort estimates. Create implementation roadmap.',
    artifact: 'FEATURE-BREAKDOWN.md',
    command: 'sigma step-10-feature-breakdown'
  },
  {
    id: 11,
    name: 'PRD Generation',
    icon: '📝',
    short: 'Production-ready PRDs for each feature',
    long: 'Generate detailed PRDs with user stories, technical specifications, API contracts, and verification criteria. Include edge cases and error handling.',
    artifact: 'docs/prds/*.md',
    command: 'sigma step-11-prd-generation'
  },
  {
    id: 12,
    name: 'Context Engine',
    icon: '🧠',
    short: 'AI context file generation',
    long: 'Generate platform-specific context files (.cursorrules, .clauderules, etc.) with project patterns, conventions, and domain knowledge.',
    artifact: '.cursorrules, .clauderules',
    command: 'sigma step-12-context-engine'
  },
  {
    id: 13,
    name: 'Skillpack Generator',
    icon: '🎓',
    short: 'Project-specific skills',
    long: 'Extract project patterns into reusable skills. Create custom prompts, commands, and workflows tailored to your domain and tech stack.',
    artifact: '.claude/skills/*.md',
    command: 'sigma step-13-skillpack-generator'
  }
];

export const PLATFORM_LOGOS = [
  {
    name: 'Claude Code',
    icon: '🤖',
    description: 'Anthropic Claude for VS Code'
  },
  {
    name: 'Cursor',
    icon: '⚡',
    description: 'AI-first code editor'
  },
  {
    name: 'Codex',
    icon: '📚',
    description: 'GPT-5.3 powered development'
  },
  {
    name: 'OpenCode',
    icon: '🔓',
    description: 'Open-source AI assistant'
  }
];

export const STATS = [
  { label: 'PRDs Generated', value: '10,000+' },
  { label: 'Production Skills', value: '189' },
  { label: 'Workflow Steps', value: '13' },
  { label: 'Platforms Supported', value: '4' }
];

export const QUICK_START_STEPS = [
  {
    step: 1,
    title: 'Install',
    command: 'brew install sigma',
    description: 'Install Sigma Protocol via Homebrew',
    estimatedTime: '30 seconds'
  },
  {
    step: 2,
    title: 'Initialize',
    command: 'cd your-project && sigma init',
    description: 'Initialize Sigma in your project directory',
    estimatedTime: '1 minute'
  },
  {
    step: 3,
    title: 'Generate',
    command: 'sigma step-1-ideation "Your product idea"',
    description: 'Generate your first PRD with AI assistance',
    estimatedTime: '5 minutes'
  }
];
