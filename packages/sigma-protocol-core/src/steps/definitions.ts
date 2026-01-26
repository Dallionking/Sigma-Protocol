/**
 * Sigma Protocol Step Definitions
 * Platform-agnostic step registry with quality gates and HITL checkpoints
 * @module @sigma-protocol/core/steps/definitions
 */

import type {
  StepDefinition,
  StepCategory,
  QualityGate,
  HITLCheckpoint,
} from "../types/step.js";

/**
 * Standard quality gate factory
 */
function createQualityGate(
  minScore: number,
  criteria: Array<{ id: string; name: string; weight: number; required?: boolean }>
): QualityGate {
  return {
    minScore,
    criteria: criteria.map((c) => ({
      id: c.id,
      name: c.name,
      description: `Validates ${c.name.toLowerCase()}`,
      weight: c.weight,
      required: c.required,
    })),
    blockOnFailure: minScore >= 80,
    allowOverride: true,
  };
}

/**
 * Standard HITL checkpoint factory
 */
function createHITLCheckpoint(
  id: string,
  title: string,
  description: string
): HITLCheckpoint {
  return {
    id,
    type: "approve",
    timing: "after",
    title,
    description,
    actions: [
      { id: "approve", label: "Approve", type: "approve" },
      { id: "modify", label: "Request Changes", type: "modify" },
      { id: "reject", label: "Reject", type: "reject" },
    ],
    required: true,
  };
}

/**
 * All Sigma Protocol step definitions
 */
export const STEP_DEFINITIONS: readonly StepDefinition[] = [
  // Step 0: Environment Setup
  {
    number: 0,
    name: "Environment Setup",
    description: "Initialize project structure, install foundation skills, and configure platform",
    category: "discovery",
    dependencies: [],
    qualityGate: createQualityGate(100, [
      { id: "skills_installed", name: "Foundation Skills Installed", weight: 0.5, required: true },
      { id: "config_valid", name: "Configuration Valid", weight: 0.5, required: true },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "scaffold", name: "Project Scaffold", path: "./", type: "code", required: true },
      { id: "skills", name: "Foundation Skills", path: ".claude/skills/", type: "markdown" },
    ],
    tools: [{ name: "file_write", required: true }, { name: "file_read", required: true }],
    skills: ["skill-creator"],
    estimatedMinutes: 15,
    tags: ["setup", "foundation"],
  },

  // Step 1: Ideation
  {
    number: 1,
    name: "Ideation",
    description: "Define product vision, value proposition, target audience, and success metrics using Hormozi Value Equation",
    category: "discovery",
    dependencies: [{ stepNumber: 0, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "problem_statement", name: "Problem Statement", weight: 0.2 },
      { id: "value_equation", name: "Hormozi Value Equation", weight: 0.25, required: true },
      { id: "target_audience", name: "Target Audience", weight: 0.2 },
      { id: "competitive_analysis", name: "Competitive Analysis", weight: 0.15 },
      { id: "success_metrics", name: "Success Metrics", weight: 0.2 },
    ]),
    hitlCheckpoints: [
      createHITLCheckpoint(
        "step1-value-proposition",
        "Review Value Proposition",
        "Review the value proposition and target audience before proceeding to architecture."
      ),
    ],
    outputs: [
      { id: "master_prd", name: "MASTER_PRD.md", path: "docs/specs/MASTER_PRD.md", type: "markdown", required: true },
    ],
    tools: [{ name: "web_search" }, { name: "file_write", required: true }],
    skills: ["brainstorming", "hormozi-frameworks", "sigmavue-research"],
    estimatedMinutes: 60,
    tags: ["ideation", "strategy", "hormozi"],
  },

  // Step 1.5: Offer Architecture (Conditional)
  {
    number: 1.5,
    name: "Offer Architecture",
    description: "Design monetization strategy, pricing tiers, and value ladder using Hormozi $100M Offers framework",
    category: "discovery",
    dependencies: [{ stepNumber: 1, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "revenue_model", name: "Revenue Model", weight: 0.4 },
      { id: "pricing_tiers", name: "Pricing Tiers", weight: 0.3 },
      { id: "value_ladder", name: "Value Ladder", weight: 0.3 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "offer_architecture", name: "OFFER-ARCHITECTURE.md", path: "docs/specs/OFFER-ARCHITECTURE.md", type: "markdown" },
    ],
    tools: [{ name: "file_write", required: true }],
    skills: ["hormozi-frameworks"],
    optional: true,
    condition: { type: "state", expression: "workflow.requiresMonetization === true" },
    estimatedMinutes: 45,
    tags: ["monetization", "pricing", "hormozi"],
  },

  // Step 2: Architecture
  {
    number: 2,
    name: "Architecture",
    description: "Design system architecture, component structure, data models, and API contracts",
    category: "design",
    dependencies: [{ stepNumber: 1, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "component_design", name: "Component Design", weight: 0.25 },
      { id: "data_flow", name: "Data Flow", weight: 0.25 },
      { id: "api_design", name: "API Design", weight: 0.25 },
      { id: "security_design", name: "Security Design", weight: 0.25 },
    ]),
    hitlCheckpoints: [
      createHITLCheckpoint(
        "step2-tech-stack",
        "Confirm Technology Stack",
        "Review and confirm the proposed technology stack and architectural decisions."
      ),
    ],
    outputs: [
      { id: "architecture", name: "ARCHITECTURE.md", path: "docs/specs/ARCHITECTURE.md", type: "markdown", required: true },
    ],
    tools: [{ name: "file_write", required: true }, { name: "file_read", required: true }],
    skills: ["architecture-patterns", "api-design-principles", "senior-architect"],
    estimatedMinutes: 90,
    tags: ["architecture", "technical", "design"],
  },

  // Step 3: UX Design
  {
    number: 3,
    name: "UX Design",
    description: "Define user flows, interaction patterns, and accessibility requirements",
    category: "design",
    dependencies: [{ stepNumber: 1, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "user_flows", name: "User Flows", weight: 0.35 },
      { id: "accessibility", name: "Accessibility", weight: 0.25 },
      { id: "mobile_first", name: "Mobile First", weight: 0.2 },
      { id: "consistency", name: "Consistency", weight: 0.2 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "ux_design", name: "UX-DESIGN.md", path: "docs/specs/UX-DESIGN.md", type: "markdown", required: true },
    ],
    tools: [{ name: "file_write", required: true }],
    skills: ["ux-designer", "frontend-design"],
    estimatedMinutes: 60,
    tags: ["ux", "design", "accessibility"],
  },

  // Step 4: Flow Tree
  {
    number: 4,
    name: "Flow Tree",
    description: "Create complete screen inventory with navigation paths and edge cases",
    category: "design",
    dependencies: [{ stepNumber: 3, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "screen_inventory", name: "Screen Inventory", weight: 0.4 },
      { id: "navigation_paths", name: "Navigation Paths", weight: 0.3 },
      { id: "edge_cases", name: "Edge Cases", weight: 0.3 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "flow_tree", name: "FLOW-TREE.md", path: "docs/specs/FLOW-TREE.md", type: "markdown", required: true },
    ],
    tools: [{ name: "file_write", required: true }],
    skills: ["ux-designer"],
    estimatedMinutes: 45,
    tags: ["navigation", "flows", "screens"],
  },

  // Step 5: Wireframe Prototypes
  {
    number: 5,
    name: "Wireframe Prototypes",
    description: "Generate wireframe PRDs with ASCII layouts and component specifications",
    category: "prototype",
    dependencies: [{ stepNumber: 4, requiredStatus: "completed" }],
    qualityGate: createQualityGate(75, [
      { id: "interactions_defined", name: "Interactions Defined", weight: 0.5 },
      { id: "responsive_layouts", name: "Responsive Layouts", weight: 0.5 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "wireframes", name: "Wireframe PRDs", path: "docs/prds/flows/", type: "markdown" },
    ],
    tools: [{ name: "file_write", required: true }, { name: "file_read", required: true }],
    skills: ["ux-designer", "web-artifacts-builder"],
    estimatedMinutes: 90,
    tags: ["wireframes", "prototype", "prds"],
  },

  // Step 6: Design System
  {
    number: 6,
    name: "Design System",
    description: "Define design tokens, component library, and style guidelines",
    category: "prototype",
    dependencies: [{ stepNumber: 3, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "token_coverage", name: "Token Coverage", weight: 0.35 },
      { id: "component_library", name: "Component Library", weight: 0.35 },
      { id: "documentation", name: "Documentation", weight: 0.3 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "design_system", name: "DESIGN-SYSTEM.md", path: "docs/specs/DESIGN-SYSTEM.md", type: "markdown", required: true },
    ],
    tools: [{ name: "file_write", required: true }],
    skills: ["frontend-design", "applying-brand-guidelines"],
    estimatedMinutes: 60,
    tags: ["design-system", "tokens", "components"],
  },

  // Step 7: Interface States
  {
    number: 7,
    name: "Interface States",
    description: "Specify all interface states: loading, error, empty, success, and partial",
    category: "prototype",
    dependencies: [
      { stepNumber: 4, requiredStatus: "completed" },
      { stepNumber: 6, requiredStatus: "completed" },
    ],
    qualityGate: createQualityGate(80, [
      { id: "state_coverage", name: "State Coverage", weight: 0.4 },
      { id: "loading_states", name: "Loading States", weight: 0.2 },
      { id: "error_states", name: "Error States", weight: 0.2 },
      { id: "empty_states", name: "Empty States", weight: 0.2 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "state_spec", name: "STATE-SPEC.md", path: "docs/specs/STATE-SPEC.md", type: "markdown", required: true },
    ],
    tools: [{ name: "file_write", required: true }],
    skills: ["frontend-design"],
    estimatedMinutes: 45,
    tags: ["states", "ui", "ux"],
  },

  // Step 8: Technical Spec
  {
    number: 8,
    name: "Technical Spec",
    description: "Create comprehensive technical specification combining all previous design decisions",
    category: "specification",
    dependencies: [
      { stepNumber: 2, requiredStatus: "completed" },
      { stepNumber: 7, requiredStatus: "completed" },
    ],
    qualityGate: createQualityGate(80, [
      { id: "implementation_ready", name: "Implementation Ready", weight: 0.4 },
      { id: "test_strategy", name: "Test Strategy", weight: 0.3 },
      { id: "migration_plan", name: "Migration Plan", weight: 0.3 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "technical_spec", name: "TECHNICAL-SPEC.md", path: "docs/specs/TECHNICAL-SPEC.md", type: "markdown", required: true },
    ],
    tools: [{ name: "file_write", required: true }, { name: "file_read", required: true }],
    skills: ["architecture-patterns", "api-design-principles"],
    estimatedMinutes: 90,
    tags: ["technical", "specification", "implementation"],
  },

  // Step 9: Landing Page (Optional)
  {
    number: 9,
    name: "Landing Page",
    description: "Design and implement high-converting landing page with CRO best practices",
    category: "specification",
    dependencies: [
      { stepNumber: 1, requiredStatus: "completed" },
      { stepNumber: 6, requiredStatus: "completed" },
    ],
    qualityGate: createQualityGate(75, [
      { id: "conversion_optimized", name: "Conversion Optimized", weight: 0.4 },
      { id: "performance", name: "Performance", weight: 0.3 },
      { id: "seo", name: "SEO", weight: 0.3 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "landing_page", name: "Landing Page", path: "src/landing/", type: "code" },
    ],
    tools: [{ name: "file_write", required: true }],
    skills: ["frontend-design", "web-artifacts-builder"],
    optional: true,
    estimatedMinutes: 120,
    tags: ["landing", "conversion", "marketing"],
  },

  // Step 10: Feature Breakdown
  {
    number: 10,
    name: "Feature Breakdown",
    description: "Decompose product into implementable features with dependencies and priorities",
    category: "specification",
    dependencies: [{ stepNumber: 8, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "features_identified", name: "All Features Identified", weight: 0.4 },
      { id: "dependencies_mapped", name: "Dependencies Mapped", weight: 0.3 },
      { id: "priorities_set", name: "Priorities Set", weight: 0.3 },
    ]),
    hitlCheckpoints: [
      createHITLCheckpoint(
        "step10-feature-scope",
        "Confirm Feature Scope",
        "Review and confirm the feature scope and implementation priorities."
      ),
    ],
    outputs: [
      { id: "feature_breakdown", name: "FEATURE-BREAKDOWN.md", path: "docs/specs/FEATURE-BREAKDOWN.md", type: "markdown", required: true },
    ],
    tools: [{ name: "file_write", required: true }, { name: "file_read", required: true }],
    skills: ["output-generation"],
    estimatedMinutes: 60,
    tags: ["features", "breakdown", "planning"],
  },

  // Step 11: PRD Generation
  {
    number: 11,
    name: "PRD Generation",
    description: "Generate implementation-ready PRDs for each feature using PR/FAQ and BDD methodologies",
    category: "implementation",
    dependencies: [{ stepNumber: 10, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "prd_completeness", name: "PRD Completeness", weight: 0.4 },
      { id: "acceptance_criteria", name: "Acceptance Criteria", weight: 0.3 },
      { id: "technical_details", name: "Technical Details", weight: 0.3 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "prds", name: "Implementation PRDs", path: "docs/prds/", type: "markdown", required: true },
    ],
    tools: [{ name: "file_write", required: true }, { name: "file_read", required: true }],
    skills: ["output-generation"],
    estimatedMinutes: 120,
    tags: ["prds", "implementation", "requirements"],
  },

  // Step 11.5: PRD Swarm (Optional)
  {
    number: 11.5,
    name: "PRD Swarm",
    description: "Orchestrate parallel PRD generation using multi-agent swarm pattern",
    category: "implementation",
    dependencies: [{ stepNumber: 10, requiredStatus: "completed" }],
    qualityGate: createQualityGate(75, [
      { id: "parallel_prds", name: "Parallel PRDs Generated", weight: 0.5 },
      { id: "consistency", name: "Swarm Consistency", weight: 0.5 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "swarm_prds", name: "Swarm PRDs", path: "docs/prds/swarm-*/", type: "markdown" },
    ],
    tools: [{ name: "file_write", required: true }, { name: "shell_exec" }],
    skills: ["output-generation"],
    optional: true,
    estimatedMinutes: 90,
    tags: ["swarm", "parallel", "prds"],
  },

  // Step 12: Context Engine
  {
    number: 12,
    name: "Context Engine",
    description: "Generate AI context configuration files for the target development platform",
    category: "implementation",
    dependencies: [{ stepNumber: 11, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "context_complete", name: "Context Complete", weight: 0.5 },
      { id: "platform_configured", name: "Platform Configured", weight: 0.5 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "cursorrules", name: ".cursorrules", path: ".cursorrules", type: "yaml" },
      { id: "agents_md", name: "AGENTS.md", path: "AGENTS.md", type: "markdown" },
    ],
    tools: [{ name: "file_write", required: true }, { name: "file_read", required: true }],
    skills: ["skill-creator"],
    estimatedMinutes: 45,
    tags: ["context", "ai", "configuration"],
  },

  // Step 13: Skillpack Generator
  {
    number: 13,
    name: "Skillpack Generator",
    description: "Generate project-specific skills that extend the foundation skillpack",
    category: "delivery",
    dependencies: [{ stepNumber: 12, requiredStatus: "completed" }],
    qualityGate: createQualityGate(80, [
      { id: "skills_generated", name: "Skills Generated", weight: 0.5 },
      { id: "platform_ready", name: "Platform Ready", weight: 0.5 },
    ]),
    hitlCheckpoints: [],
    outputs: [
      { id: "project_skills", name: "Project Skills", path: ".claude/skills/", type: "markdown" },
    ],
    tools: [{ name: "file_write", required: true }],
    skills: ["skill-creator", "writing-skills"],
    estimatedMinutes: 30,
    tags: ["skills", "generator", "delivery"],
  },
] as const;

/**
 * Get step definition by number
 */
export function getStepDefinition(stepNumber: number): StepDefinition | undefined {
  return STEP_DEFINITIONS.find((s) => s.number === stepNumber);
}

/**
 * Get all steps in a category
 */
export function getStepsByCategory(category: StepCategory): StepDefinition[] {
  return STEP_DEFINITIONS.filter((s) => s.category === category);
}

/**
 * Get required (non-optional) steps
 */
export function getRequiredSteps(): StepDefinition[] {
  return STEP_DEFINITIONS.filter((s) => !s.optional);
}

/**
 * Get step count by category
 */
export function getStepCountByCategory(): Record<StepCategory, number> {
  const counts: Record<StepCategory, number> = {
    discovery: 0,
    design: 0,
    prototype: 0,
    specification: 0,
    implementation: 0,
    delivery: 0,
  };

  for (const step of STEP_DEFINITIONS) {
    counts[step.category]++;
  }

  return counts;
}
