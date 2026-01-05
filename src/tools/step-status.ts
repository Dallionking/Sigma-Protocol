/**
 * SSS Protocol - Step Status Tool
 * 
 * OpenCode custom tool that checks which SSS steps are complete.
 * Provides a quick overview of project progress.
 * 
 * Usage in OpenCode:
 *   @status Show project progress
 *   The AI will call step_status()
 */

import { defineTool } from "opencode";
import * as fs from "fs/promises";

interface StepInfo {
  step: number;
  name: string;
  status: "complete" | "partial" | "not_started";
  primaryOutput: string;
  exists: boolean;
}

interface StatusResult {
  totalSteps: number;
  completedSteps: number;
  currentStep: number | null;
  nextStep: number | null;
  steps: StepInfo[];
  summary: string;
  recommendations: string[];
}

// Step definitions with primary outputs
const STEPS: { step: number; name: string; output: string; optional?: boolean }[] = [
  { step: 0, name: "Environment Setup", output: ".sss/config.json" },
  { step: 1, name: "Product Ideation", output: "docs/specs/MASTER_PRD.md" },
  { step: 2, name: "Architecture Design", output: "docs/architecture/ARCHITECTURE.md" },
  { step: 3, name: "UX Design", output: "docs/ux/UX-DESIGN.md" },
  { step: 4, name: "Flow Tree", output: "docs/flows/FLOW-TREE.md" },
  { step: 5, name: "Wireframes", output: "docs/wireframes/PROTOTYPE-SUMMARY.md", optional: true },
  { step: 6, name: "Design System", output: "docs/design/DESIGN-SYSTEM.md" },
  { step: 7, name: "Interface States", output: "docs/states/STATE-SPEC.md" },
  { step: 8, name: "Technical Spec", output: "docs/technical/TECHNICAL-SPEC.md" },
  { step: 9, name: "Landing Page", output: "docs/landing/LANDING-PAGE.md", optional: true },
  { step: 10, name: "Feature Breakdown", output: "docs/features/FEATURE-BREAKDOWN.md" },
  { step: 11, name: "PRD Generation", output: "docs/prds/PRD-INDEX.md" },
  { step: 12, name: "Context Engine", output: ".cursorrules" },
];

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

export default defineTool({
  name: "step_status",
  description:
    "Check the completion status of all SSS Protocol steps and identify current progress",
  parameters: {},

  async execute(): Promise<StatusResult> {
    const steps: StepInfo[] = [];
    let completedSteps = 0;
    let currentStep: number | null = null;
    let nextStep: number | null = null;

    for (const stepDef of STEPS) {
      const exists = await fileExists(stepDef.output);
      const size = exists ? await getFileSize(stepDef.output) : 0;

      // Determine status
      let status: "complete" | "partial" | "not_started";
      if (exists && size > 100) {
        status = "complete";
        completedSteps++;
      } else if (exists && size > 0) {
        status = "partial";
      } else {
        status = "not_started";
      }

      steps.push({
        step: stepDef.step,
        name: stepDef.name,
        status,
        primaryOutput: stepDef.output,
        exists,
      });

      // Track current and next step
      if (status === "partial" && currentStep === null) {
        currentStep = stepDef.step;
      }
      if (status === "not_started" && nextStep === null && !stepDef.optional) {
        nextStep = stepDef.step;
      }
    }

    // If no partial step, current is the last complete one
    if (currentStep === null) {
      const lastComplete = steps.filter((s) => s.status === "complete").pop();
      currentStep = lastComplete?.step ?? null;
    }

    // Generate summary
    const percentage = Math.round((completedSteps / STEPS.length) * 100);
    const summary = `Project Progress: ${completedSteps}/${STEPS.length} steps complete (${percentage}%)`;

    // Generate recommendations
    const recommendations: string[] = [];

    if (nextStep !== null) {
      const nextStepInfo = STEPS.find((s) => s.step === nextStep);
      recommendations.push(
        `Run /step-${nextStep}-${nextStepInfo?.name.toLowerCase().replace(/ /g, "-")} to continue`
      );
    }

    const partialSteps = steps.filter((s) => s.status === "partial");
    for (const partial of partialSteps) {
      recommendations.push(
        `Step ${partial.step} (${partial.name}) is incomplete - run verification`
      );
    }

    if (completedSteps === STEPS.length) {
      recommendations.push("All steps complete! Ready for implementation with /implement-prd");
    }

    return {
      totalSteps: STEPS.length,
      completedSteps,
      currentStep,
      nextStep,
      steps,
      summary,
      recommendations,
    };
  },
});

